const prisma = require('../config/database');
const { emitEvent } = require('../services/event.service');

const savePersonalDetails = async (req, res, next) => {
  try {
    const {
      fatherName,
      maritalStatus,
      occupation,
      annualIncome
    } = req.body;

    const userId = req.user.userId;

    if (!fatherName || !occupation) {
      return res.status(400).json({
        message: 'Father name and occupation are required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.onboardingStep !== 'KYC_COMPLETED') {
      return res.status(400).json({
        message: 'Complete KYC before submitting profile details'
      });
    }

    await prisma.userProfile.upsert({
      where: { userId },
      update: {
        fatherName,
        maritalStatus,
        occupation,
        annualIncome
      },
      create: {
        userId,
        fatherName,
        maritalStatus,
        occupation,
        annualIncome
      }
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingStep: 'PROFILE_COMPLETED'
      }
    });

    await emitEvent('PROFILE_COMPLETED', { userId });

    res.status(200).json({
      message: 'Personal details saved successfully'
    });

  } catch (err) {
    next(err);
  }
};

const saveAddress = async (req, res, next) => {
  try {
    const { address } = req.body;
    const userId = req.user.userId;

    if (!address) {
      return res.status(400).json({
        message: 'Address is required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.onboardingStep !== 'PROFILE_COMPLETED') {
      return res.status(400).json({
        message: 'Complete profile step before adding address'
      });
    }

    await prisma.userProfile.upsert({
      where: { userId },
      update: { address },
      create: { userId, address }
    });

    await emitEvent('ADDRESS_UPDATED', { userId });

    res.status(200).json({
      message: 'Address saved successfully'
    });

  } catch (err) {
    next(err);
  }
};

const saveNominee = async (req, res, next) => {
  try {
    const { nomineeName } = req.body;
    const userId = req.user.userId;

    if (!nomineeName) {
      return res.status(400).json({
        message: 'Nominee name is required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.onboardingStep !== 'PROFILE_COMPLETED') {
      return res.status(400).json({
        message: 'Complete profile step before adding nominee'
      });
    }

    await prisma.userProfile.upsert({
      where: { userId },
      update: { nomineeName },
      create: { userId, nomineeName }
    });

    await emitEvent('NOMINEE_ADDED', { userId });

    res.status(200).json({
      message: 'Nominee saved successfully'
    });

  } catch (err) {
    next(err);
  }
};

const getDraft = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const draft = await prisma.userProfile.findUnique({
      where: { userId }
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingStep: true }
    });

    res.status(200).json({
      onboardingStep: user?.onboardingStep,
      draft: draft || {}
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  savePersonalDetails,
  saveAddress,
  saveNominee,
  getDraft
};
