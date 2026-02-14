const axios = require('axios');
const { maskAadhaar, decrypt } = require('../utils/crypto.utils');
const logger = require('../config/logger');


const initiateAadhaar = async (aadhaar, userId, prisma) => {
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



const verifyPan = async (pan, userId, prisma) => {
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


const evaluateKyc = async (userId, prisma) => {
  const kyc = await prisma.kyc.findUnique({
    where: { userId }
  });

  if (!kyc) return 'kyc_not_started';

  if (kyc.aadhaarVerified && kyc.panVerified)
    return 'fully_verified';

  if (kyc.aadhaarVerified && !kyc.panVerified)
    return 'pan_pending';

  if (kyc.ckycFound)
    return 'ckyc_fetched';

  if (kyc.videoKycStatus === 'approved')
    return 'fully_verified';

  return 'video_required';
};


module.exports = {
  initiateAadhaar,
  verifyPan,
  evaluateKyc,
};
