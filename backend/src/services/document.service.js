const { S3Client, HeadObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const prisma = require('../config/database');
const { encrypt } = require('../utils/crypto.util');
const logger = require('../config/logger');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});


const generateUploadUrl = async (userId, fileType, mimeType) => {
  try {
    const allowedTypes = {
      jpg: 'image/jpeg',
      png: 'image/png',
      pdf: 'application/pdf'
    };

    if (!allowedTypes[fileType]) {
      throw new Error('Invalid file type');
    }

    if (allowedTypes[fileType] !== mimeType) {
      throw new Error('Invalid MIME type');
    }

    const key = `documents/${userId}/${Date.now()}.${fileType}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentType: mimeType
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 300 });

    return { url, key };

  } catch (err) {
    logger.error('Generate Upload URL Error:', err.message);
    throw err;
  }
};


const verifyDocument = async (userId, key, type) => {
  try {
    
    await s3.send(new HeadObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    }));

    
    const encryptedPath = encrypt(key);

    
    await prisma.document.create({
      data: {
        userId,
        type,
        path: encryptedPath,
        status: 'verified',
        verified: true
      }
    });

    return { status: 'verified' };

  } catch (err) {
    logger.error('Document Verification Error:', err.message);
    throw new Error('Document verification failed');
  }
};

module.exports = {
  generateUploadUrl,
  verifyDocument
};
