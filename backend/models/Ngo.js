const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    organizationName: {
      type: String,
      required: true,
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      required: true,
    },
    walletAddress: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      match: [/^0x[a-f0-9]{40}$/, 'Please provide a valid wallet address'],
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    documentsMetadata: {
      registrationDoc: {
        fileName: String,
        fileUrl: String,
        uploadedAt: Date,
      },
      taxExemptionDoc: {
        fileName: String,
        fileUrl: String,
        uploadedAt: Date,
      },
      otherDocs: [
        {
          fileName: String,
          fileUrl: String,
          docType: String,
          uploadedAt: Date,
        },
      ],
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
    },
    verificationNotes: {
      type: String,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ngo', ngoSchema);
