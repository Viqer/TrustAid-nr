/**
 * Campaign Controller
 * Handles campaign CRUD operations and search
 */

const Campaign = require('../models/Campaign');
const Ngo = require('../models/Ngo');
const { AppError } = require('../middleware/errorHandler');

const createCampaign = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      longDescription,
      goalAmount,
      currency,
      category,
      startDate,
      endDate,
      beneficiaries,
      image,
      tags,
    } = req.validatedData;

    // Verify user is an NGO and verified
    const ngo = await Ngo.findOne({ userId });
    if (!ngo || ngo.verificationStatus !== 'VERIFIED') {
      throw new AppError('Only verified NGOs can create campaigns.', 403);
    }

    const campaign = new Campaign({
      ngoId: ngo._id,
      title,
      description,
      longDescription,
      goalAmount,
      currency: currency || 'USD',
      category: category.toUpperCase(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      deadline: new Date(endDate),
      beneficiaries,
      image,
      tags: tags || [],
      status: 'ACTIVE',
    });

    await campaign.save();

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully.',
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

const getCampaign = async (req, res, next) => {
  try {
    const { campaignId } = req.params;

    const campaign = await Campaign.findById(campaignId).populate({
      path: 'ngoId',
      populate: { path: 'userId', select: 'email firstName lastName' },
    });

    if (!campaign) {
      throw new AppError('Campaign not found.', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Campaign retrieved successfully.',
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

const listCampaigns = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      search,
      sortBy = 'createdAt',
    } = req.query;

    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const campaigns = await Campaign.find(query)
      .populate({
        path: 'ngoId',
        select: 'organizationName',
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ [sortBy]: -1 });

    const count = await Campaign.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Campaigns retrieved successfully.',
      data: {
        campaigns,
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

const updateCampaign = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new AppError('Campaign not found.', 404);
    }

    const ngo = await Ngo.findById(campaign.ngoId);
    if (ngo.userId.toString() !== userId) {
      throw new AppError('You can only update your own campaigns.', 403);
    }

    // Update campaign
    const updatedCampaign = await Campaign.findByIdAndUpdate(
      campaignId,
      req.validatedData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Campaign updated successfully.',
      data: updatedCampaign,
    });
  } catch (error) {
    next(error);
  }
};

const closeCampaign = async (req, res, next) => {
  try {
    const { campaignId } = req.params;

    const campaign = await Campaign.findByIdAndUpdate(
      campaignId,
      { status: 'CLOSED', isActive: false },
      { new: true }
    );

    if (!campaign) {
      throw new AppError('Campaign not found.', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Campaign closed successfully.',
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCampaign,
  getCampaign,
  listCampaigns,
  updateCampaign,
  closeCampaign,
};
