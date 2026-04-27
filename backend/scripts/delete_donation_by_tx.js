/* eslint-disable no-console */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const mongoose = require('mongoose');

const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');

const DEFAULT_TX_HASH = '0xabcdef123456789abcdef123456789abcdef123456789abcdef123456789';

async function repairCampaignTotals(campaignId) {
  const confirmedDonations = await Donation.find({ campaignId, status: 'CONFIRMED' }).select('amount donorId');

  const raisedAmount = confirmedDonations.reduce((total, donation) => total + (donation.amount || 0), 0);
  const totalTransactions = confirmedDonations.length;
  const totalDonors = confirmedDonations.length;

  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    return;
  }

  campaign.raisedAmount = raisedAmount;
  campaign.totalTransactions = totalTransactions;
  campaign.totalDonors = totalDonors;

  if (campaign.status === 'COMPLETED' && campaign.isActive && raisedAmount < campaign.goalAmount) {
    campaign.status = 'ACTIVE';
  }

  await campaign.save();
}

async function main() {
  const txHash = (process.argv[2] || DEFAULT_TX_HASH).trim();
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('Missing MONGODB_URI in backend/.env');
  }

  await mongoose.connect(mongoUri);

  try {
    const donation = await Donation.findOne({ blockchainTxHash: txHash });

    if (!donation) {
      console.log(`No donation found for tx hash: ${txHash}`);
      return;
    }

    await Donation.deleteOne({ _id: donation._id });
    await repairCampaignTotals(donation.campaignId);

    console.log(`Deleted donation ${donation._id} for tx hash: ${txHash}`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error('Delete failed:', error.message);
  process.exitCode = 1;
});