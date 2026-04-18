/**
 * NGO Controller
 * Handles NGO application, document upload, and verification
 */

const Ngo = require('../models/Ngo');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

const POPULATE_USER_FIELDS = 'email firstName lastName';

/**
 * @param {object} userRef — populated user subdoc or plain object with firstName, lastName, email, _id
 */
const shapeUserIdForResponse = (userRef) => {
  if (!userRef) return null;
  const u = userRef.toObject ? userRef.toObject() : { ...userRef };
  return {
    _id: u._id,
    name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
    email: u.email,
  };
};

const serializeNgoForResponse = (ngoDoc) => {
  const plain = ngoDoc.toObject ? ngoDoc.toObject() : { ...ngoDoc };
  if (plain.userId && typeof plain.userId === 'object' && plain.userId.email !== undefined) {
    plain.userId = shapeUserIdForResponse(plain.userId);
  }
  return plain;
};

const fetchNgoSerialized = async (ngoId) => {
  const doc = await Ngo.findById(ngoId).populate('userId', POPULATE_USER_FIELDS);
  if (!doc) return null;
  return serializeNgoForResponse(doc);
};

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
    await User.findByIdAndUpdate(userId, { role: 'NGO' }, { new: true });

    await ngo.save();

    const serialized = await fetchNgoSerialized(ngo._id);
    if (!serialized) {
      throw new AppError('NGO not found after creation.', 500);
    }

    res.status(201).json({
      success: true,
      ngo: serialized,
    });
  } catch (error) {
    next(error);
  }
};

const getNgoProfile = async (req, res, next) => {
  try {
    const { ngoId } = req.params;

    const ngo = await Ngo.findById(ngoId).populate('userId', POPULATE_USER_FIELDS);
    if (!ngo) {
      throw new AppError('NGO not found.', 404);
    }

    res.status(200).json({
      success: true,
      ngo: serializeNgoForResponse(ngo),
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

    const serialized = await fetchNgoSerialized(ngo._id);
    if (!serialized) {
      throw new AppError('NGO not found.', 404);
    }

    res.status(200).json({
      success: true,
      ngo: serialized,
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

    const updated = await Ngo.findByIdAndUpdate(
      ngoId,
      {
        verificationStatus: status,
        verificationNotes: notes || null,
        verifiedBy: status === 'VERIFIED' ? adminId : null,
        verifiedAt: status === 'VERIFIED' ? new Date() : null,
      },
      { new: true }
    );

    if (!updated) {
      throw new AppError('NGO not found.', 404);
    }

    const serialized = await fetchNgoSerialized(updated._id);
    if (!serialized) {
      throw new AppError('NGO not found.', 404);
    }

    res.status(200).json({
      success: true,
      ngo: serialized,
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

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const ngos = await Ngo.find(query)
      .populate('userId', POPULATE_USER_FIELDS)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ createdAt: -1 });

    const count = await Ngo.countDocuments(query);

    res.status(200).json({
      success: true,
      ngos: ngos.map((doc) => serializeNgoForResponse(doc)),
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(count / limitNum) || 0,
        total: count,
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
