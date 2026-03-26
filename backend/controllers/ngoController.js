/**
 * NGO Controller
 * Handles NGO application, document upload, and verification
 */

const Ngo = require('../models/Ngo');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

const applyAsNgo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      organizationName,
      registrationNumber,
      description,
      website,
      phone,
      address,
    } = req.validatedData;

    // Check if already an NGO
    const existingNgo = await Ngo.findOne({ userId });
    if (existingNgo) {
      throw new AppError('User already has an NGO application.', 400);
    }

    // Create NGO application
    const ngo = new Ngo({
      userId,
      organizationName,
      registrationNumber,
      description,
      website,
      phone,
      address,
      verificationStatus: 'PENDING',
    });

    // Update user role
    const user = await User.findByIdAndUpdate(userId, { role: 'NGO' }, { new: true });

    await ngo.save();

    res.status(201).json({
      success: true,
      message: 'NGO application submitted successfully.',
      data: {
        ngo,
        user: user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getNgoProfile = async (req, res, next) => {
  try {
    const { ngoId } = req.params;

    const ngo = await Ngo.findById(ngoId).populate('userId', 'email firstName lastName');
    if (!ngo) {
      throw new AppError('NGO not found.', 404);
    }

    res.status(200).json({
      success: true,
      message: 'NGO profile retrieved successfully.',
      data: ngo,
    });
  } catch (error) {
    next(error);
  }
};

const uploadDocumentMetadata = async (req, res, next) => {
  try {
    const { ngoId } = req.params;
    const { documentType, fileName, fileUrl } = req.validatedData;

    const ngo = await Ngo.findById(ngoId);
    if (!ngo) {
      throw new AppError('NGO not found.', 404);
    }

    // Update document metadata
    if (documentType === 'registration') {
      ngo.documentsMetadata.registrationDoc = {
        fileName,
        fileUrl,
        uploadedAt: new Date(),
      };
    } else if (documentType === 'taxExemption') {
      ngo.documentsMetadata.taxExemptionDoc = {
        fileName,
        fileUrl,
        uploadedAt: new Date(),
      };
    } else if (documentType === 'other') {
      ngo.documentsMetadata.otherDocs.push({
        fileName,
        fileUrl,
        docType: req.validatedData.docType || 'Other',
        uploadedAt: new Date(),
      });
    }

    await ngo.save();

    res.status(200).json({
      success: true,
      message: 'Document metadata uploaded successfully.',
      data: ngo,
    });
  } catch (error) {
    next(error);
  }
};

const verifyNgo = async (req, res, next) => {
  try {
    const { ngoId } = req.params;
    const { status, notes } = req.validatedData;
    const adminId = req.user.id;

    const ngo = await Ngo.findByIdAndUpdate(
      ngoId,
      {
        verificationStatus: status,
        verificationNotes: notes || null,
        verifiedBy: status === 'VERIFIED' ? adminId : null,
        verifiedAt: status === 'VERIFIED' ? new Date() : null,
      },
      { new: true }
    );

    if (!ngo) {
      throw new AppError('NGO not found.', 404);
    }

    res.status(200).json({
      success: true,
      message: `NGO ${status.toLowerCase()} successfully.`,
      data: ngo,
    });
  } catch (error) {
    next(error);
  }
};

const listNgos = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) {
      query.verificationStatus = status;
    }

    const ngos = await Ngo.find(query)
      .populate('userId', 'email firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Ngo.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'NGOs retrieved successfully.',
      data: {
        ngos,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          total: count,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyAsNgo,
  getNgoProfile,
  uploadDocumentMetadata,
  verifyNgo,
  listNgos,
};
