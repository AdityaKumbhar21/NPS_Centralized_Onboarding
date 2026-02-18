const {
  initiateAadhaar,
  verifyPan,
  startVideoKyc,
  completeVideoKyc
} = require('../services/kyc.service');

const prisma = require('../config/database');
const { emitEvent } = require('../services/event.service');

const initiateAadhaarController = async (req, res, next) => {
  try {
    const { aadhaar } = req.body;
    const userId = req.user.userId;

    if (!aadhaar || !/^\d{12}$/.test(aadhaar)) {
      return res.status(400).json({ message: 'Invalid Aadhaar number' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (
      user.kycStatus === 'AADHAAR_VERIFIED' ||
      user.kycStatus === 'PAN_VERIFIED' ||
      user.kycStatus === 'APPROVED'
    ) {
      return res.status(400).json({
        message: 'Aadhaar already verified'
      });
    }

    const result = await initiateAadhaar(aadhaar, userId);

    await emitEvent('AADHAAR_VERIFIED', { userId });

    res.status(200).json({
      message: 'Aadhaar verification successful',
      data: result
    });

  } catch (err) {
    next(err);
  }
};

const verifyPanController = async (req, res, next) => {
  try {
    const { pan } = req.body;
    const userId = req.user.userId;

    if (!pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
      return res.status(400).json({ message: 'Invalid PAN format' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.kycStatus !== 'AADHAAR_VERIFIED') {
      return res.status(400).json({
        message: 'Complete Aadhaar verification first'
      });
    }

    const result = await verifyPan(pan, userId);

    await emitEvent('PAN_VERIFIED', { userId });

    res.status(200).json({
      message: 'PAN verification completed',
      data: result
    });

  } catch (err) {
    next(err);
  }
};

const startVideoKycController = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // allow starting even if not strictly VIDEO_REQUIRED for POC
    const result = await startVideoKyc(userId);

    // generate presigned S3 PUT URL for uploading the video
    const AWS = require('aws-sdk');
    const s3 = new AWS.S3({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });

    const key = `video_kyc/${userId}/${result.sessionId}.webm`;
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentType: 'video/webm',
      ACL: 'private',
      Expires: 600
    };

    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);

    await emitEvent('VIDEO_KYC_STARTED', { userId });

    res.status(200).json({ sessionId: result.sessionId, uploadUrl, key });

  } catch (err) {
    next(err);
  }
};

const completeVideoKycController = async (req, res, next) => {
  try {
    const { sessionId, s3Key } = req.body;
    const userId = req.user.userId;

    if (!sessionId) {
      return res.status(400).json({
        message: 'Session ID required'
      });
    }

    const result = await completeVideoKyc(userId, sessionId, s3Key);

    await emitEvent('VIDEO_KYC_COMPLETED', { userId });

    res.status(200).json({
      message: 'Video KYC completed successfully',
      data: result
    });

  } catch (err) {
    next(err);
  }
};

const getKycStatusController = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        kycStatus: true,
        onboardingStep: true
      }
    });

    res.status(200).json({
      kycStatus: user?.kycStatus,
      onboardingStep: user?.onboardingStep
    });

  } catch (err) {
    next(err);
  }
};

const getKycDetailsController = async (req, res, next) => {
  try {
    const kyc = await prisma.kyc.findUnique({
      where: { userId: req.user.userId }
    });

    if (!kyc) {
      return res.status(404).json({ message: 'KYC not found' });
    }

    res.status(200).json({ kyc });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  initiateAadhaarController,
  verifyPanController,
  startVideoKycController,
  completeVideoKycController,
  getKycStatusController,
  getKycDetailsController
};
