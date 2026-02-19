const { encrypt } = require('../utils/crypto.util');
const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const redisClient = require('../config/redis');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt.util');
const logger = require('../config/logger');

// ─── PHASE 2: Aadhaar 2-Step Flow (initiate → OTP → verify → JWT) ─────────────

const DEMO_MOBILE = '9999999999';

/**
 * Step 1 of Aadhaar flow: generate OTP, store in Redis, return maskedMobile + OTP (dev only)
 */
const initiateAadhaarFlow = async (aadhaar) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  // Store OTP keyed by Aadhaar (5 min expiry)
  await redisClient.setEx(`aadhaar_otp:${aadhaar}`, 300, hashedOtp);
  // Map Aadhaar → demo mobile for this session
  await redisClient.setEx(`aadhaar_mobile:${aadhaar}`, 300, DEMO_MOBILE);

  const masked = DEMO_MOBILE.replace(/.(?=.{2})/g, 'x');
  logger.info(`DEV Aadhaar OTP for ${aadhaar.slice(-4)}: ${otp}`);

  const isDev = process.env.NODE_ENV !== 'production';
  return {
    message: `OTP sent to ${masked}`,
    maskedMobile: masked,
    ...(isDev ? { otp } : {})
  };
};

/**
 * Step 2 of Aadhaar flow: verify OTP, upsert user + KYC record, return JWT
 */
const verifyAadhaarFlow = async (aadhaar, otp) => {
  const storedHash = await redisClient.get(`aadhaar_otp:${aadhaar}`);
  if (!storedHash) throw new Error('OTP expired. Please initiate Aadhaar verification again.');

  const isValid = await bcrypt.compare(otp, storedHash);
  if (!isValid) throw new Error('Invalid OTP');

  const mobile = (await redisClient.get(`aadhaar_mobile:${aadhaar}`)) || DEMO_MOBILE;
  await redisClient.del(`aadhaar_otp:${aadhaar}`);
  await redisClient.del(`aadhaar_mobile:${aadhaar}`);

  const last4 = aadhaar.slice(-4);

  // Find or create user by mobile
  let user = await prisma.user.findUnique({ where: { mobile } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        mobile,
        isVerified: true,
        onboardingStep: 'KYC_PENDING',
        kycStatus: 'AADHAAR_VERIFIED'
      }
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, kycStatus: 'AADHAAR_VERIFIED', onboardingStep: 'KYC_PENDING' }
    });
  }

  // Upsert KYC record with mock demographic data
  await prisma.kyc.upsert({
    where: { userId: user.id },
    update: {
      aadhaarVerified: true,
      aadhaarLast4: last4,
      name: 'Demo User',
      dob: new Date('1990-01-01'),
      gender: 'M'
    },
    create: {
      userId: user.id,
      aadhaarVerified: true,
      aadhaarLast4: last4,
      name: 'Demo User',
      dob: new Date('1990-01-01'),
      gender: 'M'
    }
  });

  const token = generateAccessToken({ userId: user.id });
  const refreshToken = generateRefreshToken({ userId: user.id });
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  return { token, refreshToken, onboardingStep: 'KYC_PENDING', kycStatus: 'AADHAAR_VERIFIED' };
};

// ──────────────────────────────────────────────────────────────────────────────

const initiateAadhaar = async (aadhaar, userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) throw new Error('User not found');

    const last4 = aadhaar.slice(-4);

    const kyc = await prisma.kyc.upsert({
      where: { userId },
      update: {
        aadhaarVerified: true,
        aadhaarLast4: last4,
        name: "John Doe",
        dob: new Date("1990-01-01"),
        gender: "M"
      },
      create: {
        userId,
        aadhaarVerified: true,
        aadhaarLast4: last4,
        name: "John Doe",
        dob: new Date("1990-01-01"),
        gender: "M"
      }
    });

    return kyc;

  } catch (err) {
    throw new Error('Aadhaar verification failed');
  }
};



const verifyPan = async (pan, userId) => {
  try {
    const kyc = await prisma.kyc.findUnique({
      where: { userId }
    });

    if (!kyc) throw new Error('Complete Aadhaar first');

    const match = kyc.name === "John Doe"; // mock

    await prisma.kyc.update({
      where: { userId },
      data: {
        panVerified: match,
        panNumber: pan
      }
    });

    // Advance onboardingStep and kycStatus
    await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: 'PAN_VERIFIED',
        onboardingStep: 'KYC_COMPLETED'
      }
    });

    return { panVerified: match };

  } catch (err) {
    throw new Error('PAN verification failed');
  }
};



const evaluateKyc = async (userId) => {
  const kyc = await prisma.kyc.findUnique({
    where: { userId }
  });

  if (!kyc) return 'NOT_STARTED';

  if (kyc.aadhaarVerified && kyc.panVerified)
    return 'APPROVED';

  if (kyc.aadhaarVerified && !kyc.panVerified)
    return 'PAN_PENDING';

  if (kyc.videoKycStatus === 'APPROVED')
    return 'APPROVED';

  if (kyc.videoKycStatus === 'INITIATED')
    return 'VIDEO_REQUIRED';

  return 'VIDEO_REQUIRED';
};



/**
 * Start Video KYC
 */
const startVideoKyc = async (userId) => {
  const sessionId = 'vid_' + Date.now();

  // Create separate VideoKycSession record (as per your schema)
  await prisma.videoKycSession.create({
    data: {
      userId,
      sessionId,
      status: 'INITIATED'
    }
  });

  // Update KYC status
  await prisma.kyc.upsert({
    where: { userId },
    update: {
      videoKycStatus: 'INITIATED'
    },
    create: {
      userId,
      videoKycStatus: 'INITIATED'
    }
  });

  return { sessionId };
};



/**
 * Complete Video KYC
 */
const completeVideoKyc = async (userId, sessionId, s3Key) => {
  const encryptedPath = s3Key ? encrypt(s3Key) : null;

  // Upsert session — create demo/dev session if it doesn't exist
  await prisma.videoKycSession.upsert({
    where: { sessionId },
    update: { status: 'APPROVED' },
    create: {
      userId,
      sessionId,
      status: 'APPROVED'
    }
  });

  // Upsert KYC record — only set videoKycStatus (no 'status' field in schema)
  await prisma.kyc.upsert({
    where: { userId },
    update: { videoKycStatus: 'APPROVED' },
    create: {
      userId,
      videoKycStatus: 'APPROVED'
    }
  });

  // Advance onboarding step to KYC_COMPLETED (valid enum value)
  await prisma.user.update({
    where: { id: userId },
    data: { onboardingStep: 'KYC_COMPLETED' }
  });

  if (encryptedPath) {
    await prisma.document.create({
      data: {
        userId,
        type: 'VIDEO_KYC',
        path: encryptedPath,
        status: 'VERIFIED',
        verified: true
      }
    });
  }

  return { status: 'APPROVED', sessionId };
};



module.exports = {
  initiateAadhaarFlow,
  verifyAadhaarFlow,
  initiateAadhaar,
  verifyPan,
  evaluateKyc,
  startVideoKyc,
  completeVideoKyc
};
