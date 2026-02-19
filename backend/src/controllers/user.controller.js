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

    // Accept profile save from any authenticated user regardless of onboarding step
    const blockedSteps = ['PFM_SELECTED', 'PAYMENT_COMPLETED', 'PRAN_GENERATED'];
    if (blockedSteps.includes(user.onboardingStep)) {
      return res.status(400).json({
        message: 'Profile already completed'
      });
    }

    await prisma.userProfile.upsert({
      where: { userId },
      update: {
        fatherName,
        maritalStatus,
        occupation,
        annualIncome: annualIncome ? parseInt(annualIncome, 10) : null
      },
      create: {
        userId,
        fatherName,
        maritalStatus,
        occupation,
        annualIncome: annualIncome ? parseInt(annualIncome, 10) : null
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
    const { nominees, nomineeName } = req.body;
    const userId = req.user.userId;

    // Support both array payload (frontend) and legacy single-name payload
    const nomineeNameValue = nomineeName
      || (Array.isArray(nominees) && nominees.length > 0 ? nominees[0].name : null);

    if (!nomineeNameValue) {
      return res.status(400).json({
        message: 'At least one nominee is required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Relax step guard — allow nominee save from any authenticated user
    const blockedSteps = ['PAYMENT_COMPLETED', 'PRAN_GENERATED'];
    if (blockedSteps.includes(user.onboardingStep)) {
      return res.status(400).json({ message: 'Nominee already submitted' });
    }

    await prisma.userProfile.upsert({
      where: { userId },
      update: { nomineeName: nomineeNameValue },
      create: { userId, nomineeName: nomineeNameValue }
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
