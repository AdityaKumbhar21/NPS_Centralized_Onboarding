const {
  initiateAadhaarFlow,
  verifyAadhaarFlow,
  initiateAadhaar,
  verifyPan,
  startVideoKyc,
  completeVideoKyc
} = require('../services/kyc.service');

const prisma = require('../config/database');
const { emitEvent } = require('../services/event.service');

// ─── PHASE 2a: Aadhaar Initiate (NO AUTH – public route) ────────────────────
const initiateAadhaarFlowController = async (req, res, next) => {
  try {
    const { aadhaar } = req.body;
    if (!aadhaar || !/^\d{12}$/.test(aadhaar)) {
      return res.status(400).json({ message: 'Invalid Aadhaar number (must be 12 digits)' });
    }

    const result = await initiateAadhaarFlow(aadhaar);

    await emitEvent('AADHAAR_OTP_SENT', { aadhaarLast4: aadhaar.slice(-4) });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// ─── PHASE 2b: Aadhaar OTP Verify (NO AUTH – returns JWT) ───────────────────
const verifyAadhaarFlowController = async (req, res, next) => {
  try {
    const { aadhaar, otp } = req.body;
    if (!aadhaar || !/^\d{12}$/.test(aadhaar)) {
      return res.status(400).json({ message: 'Invalid Aadhaar number' });
    }
    if (!otp || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: 'Invalid OTP format (must be 6 digits)' });
    }

    const result = await verifyAadhaarFlow(aadhaar, otp);

    await emitEvent('AADHAAR_VERIFIED', { aadhaarLast4: aadhaar.slice(-4) });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

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

    // Allow PAN if user hasn't done it yet OR if retrying (idempotent)
    const panAllowedStatuses = ['AADHAAR_VERIFIED', 'NOT_STARTED', 'PAN_VERIFIED', 'KYC_COMPLETED'];
    if (!panAllowedStatuses.includes(user.kycStatus)) {
      return res.status(400).json({
        message: 'KYC status does not allow PAN verification at this stage'
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

    // In dev/demo mode, skip real AWS S3 and return a mock URL
    const isDev = process.env.NODE_ENV !== 'production';
    let uploadUrl = `https://demo-bucket.s3.amazonaws.com/video_kyc/${userId}/${result.sessionId}.webm?demo=true`;
    let key = `video_kyc/${userId}/${result.sessionId}.webm`;

    if (!isDev && process.env.AWS_S3_BUCKET) {
      try {
        const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
        const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
        const s3 = new S3Client({
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
          }
        });
        key = `video_kyc/${userId}/${result.sessionId}.webm`;
        const command = new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: key,
          ContentType: 'video/webm'
        });
        uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 });
      } catch (s3Err) {
        // Fall back to demo URL if S3 signing fails
        uploadUrl = `https://demo-bucket.s3.amazonaws.com/${key}?demo=true`;
      }
    }

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
  initiateAadhaarFlowController,
  verifyAadhaarFlowController,
  initiateAadhaarController,
  verifyPanController,
  startVideoKycController,
  completeVideoKycController,
  getKycStatusController,
  getKycDetailsController
};
