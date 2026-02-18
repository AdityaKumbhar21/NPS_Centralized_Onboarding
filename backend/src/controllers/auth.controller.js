const prisma = require('../config/database');
const { sendOtp, verifyOtp } = require('../services/otp.service');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} = require('../utils/jwt.util');
const { emitEvent } = require('../services/event.service');
const logger = require('../config/logger');

const sendOtpController = async (req, res, next) => {
  try {
    let { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ message: 'Mobile number required' });
    }

    mobile = mobile.trim();

    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ message: 'Invalid mobile number' });
    }

    const message = await sendOtp(mobile);

    res.status(200).json({ message });

  } catch (err) {
    next(err);
  }
};

const verifyOtpController = async (req, res, next) => {
  try {
    let { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ message: 'Mobile and OTP required' });
    }

    mobile = mobile.trim();

    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ message: 'Invalid mobile number' });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: 'Invalid OTP format' });
    }

    await verifyOtp(mobile, otp);

    let user = await prisma.user.findUnique({
      where: { mobile }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          mobile,
          isVerified: true,
          onboardingStep: 'KYC_PENDING',
          kycStatus: 'NOT_STARTED'
        }
      });

      await emitEvent('USER_REGISTERED', { userId: user.id });
    } else {
      user = await prisma.user.update({
        where: { mobile },
        data: {
          isVerified: true
        }
      });
    }

    await emitEvent('USER_MOBILE_VERIFIED', { userId: user.id });

    const token = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    user = await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    res.status(200).json({
      token,
      refreshToken,
      onboardingStep: user.onboardingStep,
      kycStatus: user.kycStatus
    });

  } catch (err) {
    logger.warn('OTP verification failed:', err.message);
    next(err);
  }
};

const refreshTokenController = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.refreshToken !== refreshToken) {
      logger.warn(`Invalid refresh attempt for user ${decoded.userId}`);
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken({ userId: user.id });
    const newRefreshToken = generateRefreshToken({ userId: user.id });

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken }
    });

    await emitEvent('TOKEN_REFRESHED', { userId: user.id });

    res.status(200).json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
      onboardingStep: updatedUser.onboardingStep,
      kycStatus: updatedUser.kycStatus
    });

  } catch (err) {
    logger.warn('Refresh token error:', err.message);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

const logoutController = async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { refreshToken: null }
    });

    await emitEvent('USER_LOGOUT', { userId: req.user.userId });

    res.status(200).json({ message: 'Logged out successfully' });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  sendOtpController,
  verifyOtpController,
  refreshTokenController,
  logoutController
};
