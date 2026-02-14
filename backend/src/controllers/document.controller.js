const { generateUploadUrl, verifyDocument } = require('../services/document.service');
const prisma = require('../config/database');


const generateUploadUrlController = async (req, res, next) => {
  try {
    const { fileType, mimeType } = req.body;
    const userId = req.user.userId;

    const allowedFileTypes = ['jpg', 'png', 'pdf'];

    if (!fileType || !allowedFileTypes.includes(fileType)) {
      return res.status(400).json({ message: 'Invalid file type' });
    }

    const { url, key } = await generateUploadUrl(userId, fileType, mimeType);

    res.status(200).json({ url, key });

  } catch (err) {
    next(err);
  }
};


const verifyDocumentController = async (req, res, next) => {
  try {
    const { key, type } = req.body;
    const userId = req.user.userId;

    const allowedTypes = ['photo', 'signature', 'address_proof', 'pan_copy'];

    if (!key || !type || !allowedTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid document data' });
    }

    // Ensure key belongs to this user
    if (!key.startsWith(`documents/${userId}/`)) {
      return res.status(403).json({ message: 'Unauthorized document access' });
    }

    const { status } = await verifyDocument(userId, key, type);

    res.status(200).json({ status });

  } catch (err) {
    next(err);
  }
};


const getDocumentStatus = async (req, res, next) => {
  try {
    const { type } = req.query;
    const userId = req.user.userId;

    const allowedTypes = ['photo', 'signature', 'address_proof', 'pan_copy'];

    if (!type || !allowedTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    const doc = await prisma.document.findFirst({
      where: { userId, type }
    });

    res.status(200).json({
      status: doc?.status || 'pending'
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  generateUploadUrlController,
  verifyDocumentController,
  getDocumentStatus
};
