const { encrypt } = require('../utils/crypto.util');
const prisma = require('../config/database');


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

  // Update session status
  await prisma.videoKycSession.update({
    where: { sessionId },
    data: { status: 'APPROVED' }
  });

  // Update main KYC record
  await prisma.kyc.update({
    where: { userId },
    data: {
      videoKycStatus: 'APPROVED'
    }
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

  return {
    status: 'APPROVED',
    sessionId
  };
};



module.exports = {
  initiateAadhaar,
  verifyPan,
  evaluateKyc,
  startVideoKyc,
  completeVideoKyc
};
