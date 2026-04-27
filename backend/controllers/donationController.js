/**
 * Donation Controller
 * Handles donation creation and retrieval
 */

const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const Ngo = require('../models/Ngo');
const blockchainService = require('../blockchain/blockchainService');
const { AppError } = require('../middleware/errorHandler');

const crypto = require('crypto');

const createLocalWalletId = () => `lw_${crypto.randomBytes(12).toString('hex')}`;

const ensureLocalWalletId = async (entity) => {
  if (!entity.localWalletId) {
    entity.localWalletId = createLocalWalletId();
    await entity.save();
  }

  return entity.localWalletId;
};

const createDonation = async (req, res, next) => {
  try {
    const donorId = req.user.id;
    const {
      amount,
      currency,
      campaignId,
      paymentMethod,
      donorMessage,
      isAnonymous,
    } = req.validatedData;

    // Verify campaign exists and is active
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new AppError('Campaign not found.', 404);
    }

    if (!campaign.isActive || campaign.status !== 'ACTIVE') {
      throw new AppError('Campaign is not active.', 400);
    }

    // Get donor and NGO info
    const donor = await User.findById(donorId);
    const ngo = await Ngo.findById(campaign.ngoId);

    // Create donation record
    const donation = new Donation({
      amount,
      currency: currency || 'USD',
      campaignId,
      ngoId: ngo._id,
      donorId,
      paymentMethod: paymentMethod || 'CARD',
      donorEmail: isAnonymous ? null : donor.email,
      donorName: isAnonymous ? null : `${donor.firstName} ${donor.lastName}`,
      donorMessage: donorMessage || null,
      isAnonymous: isAnonymous || false,
      status: 'PENDING',
    });

    await donation.save();

    // Update campaign stats
    campaign.totalDonors = (campaign.totalDonors || 0) + 1;
    campaign.totalTransactions = (campaign.totalTransactions || 0) + 1;
    await campaign.save();

    res.status(201).json({
      success: true,
      message: 'Donation created successfully. Awaiting blockchain confirmation.',
      data: {
        donation,
      },
    });
  } catch (error) {
    next(error);
  }
};

const confirmDonation = async (req, res, next) => {
  try {
    const { donationId } = req.params;
    const { blockchainTxHash, blockNumber, network, status } = req.validatedData;

    const donation = await Donation.findById(donationId);
    if (!donation) {
      throw new AppError('Donation not found.', 404);
    }

    // Update donation with blockchain details
    donation.status = status || 'CONFIRMED';
    donation.blockchainTxHash = blockchainTxHash;
    donation.blockNumber = blockNumber;
    donation.network = network;

    await donation.save();

    // If confirmed, update campaign raised amount
    if (donation.status === 'CONFIRMED') {
      const campaign = await Campaign.findById(donation.campaignId);
      campaign.raisedAmount = (campaign.raisedAmount || 0) + donation.amount;

      // Check if goal reached
      if (campaign.raisedAmount >= campaign.goalAmount) {
        campaign.status = 'COMPLETED';
      }

      await campaign.save();
    }

    res.status(200).json({
      success: true,
      message: 'Donation confirmed successfully.',
      data: donation,
    });
  } catch (error) {
    next(error);
  }
};

const getDonation = async (req, res, next) => {
  try {
    const { donationId } = req.params;

    const donation = await Donation.findById(donationId)
      .populate('campaignId', 'title goalAmount')
      .populate('ngoId', 'organizationName')
      .populate('donorId', 'email firstName lastName');

    if (!donation) {
      throw new AppError('Donation not found.', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Donation retrieved successfully.',
      data: donation,
    });
  } catch (error) {
    next(error);
  }
};

const getDonorDonations = async (req, res, next) => {
  try {
    const donorId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { donorId };
    if (status) {
      query.status = status;
    }

    const donations = await Donation.find(query)
      .populate('campaignId', 'title goalAmount image')
      .populate('ngoId', 'organizationName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Donation.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Donor donations retrieved successfully.',
      data: {
        donations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          total: count,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCampaignDonations = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const donations = await Donation.find({
      campaignId,
      status: 'CONFIRMED',
    })
      .select('-donorEmail -donorName') // Hide sensitive donor info
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Donation.countDocuments({
      campaignId,
      status: 'CONFIRMED',
    });

    res.status(200).json({
      success: true,
      message: 'Campaign donations retrieved successfully.',
      data: {
        donations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          total: count,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getLedgerDonations = async (req, res, next) => {
  try {
    const rawLimit = parseInt(req.query.limit, 10);
    const rawPage = parseInt(req.query.page, 10);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 10) : null;
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

    const query = {
      status: 'CONFIRMED',
      blockchainTxHash: { $ne: null },
    };

    const ledgerQuery = Donation.find(query)
      .populate('donorId', 'walletAddress localWalletId')
      .populate('ngoId', 'organizationName')
      .sort({ createdAt: -1 });

    if (limit) {
      ledgerQuery.limit(limit).skip((page - 1) * limit);
    }

    const [donations, totalCount] = await Promise.all([
      ledgerQuery,
      Donation.countDocuments(query),
    ]);

    const ledgerEntries = donations.map((donation) => ({
      donationId: donation._id,
      txHash: donation.blockchainTxHash,
      donorAddress: donation.donorId?.localWalletId || donation.donorId?.walletAddress || null,
      ngoName: donation.ngoId?.organizationName || 'Unknown NGO',
      amount: donation.amount,
      currency: donation.currency || 'INR',
      timestamp: donation.createdAt,
    }));

    res.status(200).json({
      success: true,
      message: 'Ledger donations retrieved successfully.',
      data: {
        entries: ledgerEntries,
        totalCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

const dummyDonate = async (req, res, next) => {
  try {
    const donorId = req.user.id;
    const { amount, campaignId } = req.validatedData;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new AppError('Campaign not found.', 404);
    }

    if (!campaign.isActive || campaign.status !== 'ACTIVE') {
      throw new AppError('Campaign is not active.', 400);
    }

    const donor = await User.findById(donorId);
    if (!donor) {
      throw new AppError('Donor not found.', 404);
    }

    const ngo = await Ngo.findById(campaign.ngoId);
    if (!ngo) {
      throw new AppError('NGO not found.', 404);
    }

    const donorWalletId = await ensureLocalWalletId(donor);
    const ngoWalletId = await ensureLocalWalletId(ngo);

    const { txHash } = await blockchainService.logDonation({
      donorWalletId,
      ngoWalletId,
      amount,
      donorId,
      campaignId,
    });

    if (!txHash) {
      throw new AppError('Blockchain transaction failed to return a valid hash.', 502);
    }

    const donation = new Donation({
      amount,
      currency: 'INR',
      campaignId,
      ngoId: ngo._id,
      donorId,
      paymentMethod: 'CRYPTO',
      donorEmail: donor.email,
      donorName: `${donor.firstName} ${donor.lastName}`,
      donorMessage: null,
      isAnonymous: false,
      status: 'CONFIRMED',
      blockchainTxHash: txHash,
      network: 'ETHEREUM',
    });

    await donation.save();

    campaign.raisedAmount = (campaign.raisedAmount || 0) + amount;
    campaign.totalDonors = (campaign.totalDonors || 0) + 1;
    campaign.totalTransactions = (campaign.totalTransactions || 0) + 1;

    if (campaign.raisedAmount >= campaign.goalAmount) {
      campaign.status = 'COMPLETED';
    }

    await campaign.save();

    res.status(201).json({
      success: true,
      txHash,
      donationId: donation._id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDonation,
  confirmDonation,
  getDonation,
  getDonorDonations,
  getCampaignDonations,
  getLedgerDonations,
  dummyDonate,
};
