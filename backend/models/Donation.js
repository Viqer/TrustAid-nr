const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR'],
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ngo',
      required: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'FAILED'],
      default: 'PENDING',
    },
    // Blockchain details
    blockchainTxHash: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },
    blockNumber: {
      type: Number,
      default: null,
    },
    network: {
      type: String,
      default: null,
      enum: ['ETHEREUM', 'POLYGON', 'BINANCE', null],
    },
    // Payment method tracking
    paymentMethod: {
      type: String,
      enum: ['CARD', 'BANK_TRANSFER', 'CRYPTO', 'PAYPAL'],
      default: 'CARD',
    },
    // Donor info snapshot
    donorEmail: String,
    donorName: String,
    donorMessage: {
      type: String,
      default: null,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Donation', donationSchema);
