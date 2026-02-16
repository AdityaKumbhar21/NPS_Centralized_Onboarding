const prisma = require('../config/database');

const acceptConsent = async (req, res, next) => {
  try {
    const { consentType } = req.body;
    const userId = req.user.userId;

    const allowedTypes = [
      'TERMS_AND_CONDITIONS',
      'PRIVACY_POLICY',
      'CKYC_CONSENT',
      'VIDEO_KYC_CONSENT',
      'NPS_DECLARATION'
    ];

    if (!consentType || !allowedTypes.includes(consentType)) {
      return res.status(400).json({ message: 'Invalid consent type' });
    }

    await prisma.consent.create({
      data: {
        userId,
        consentType,
        ipAddress: req.ip
      }
    });

    res.status(200).json({ message: 'Consent accepted' });

  } catch (err) {
    next(err);
  }
};

const getConsentHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const history = await prisma.consent.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' }
    });

    res.status(200).json(history);

  } catch (err) {
    next(err);
  }
};

module.exports = {
  acceptConsent,
  getConsentHistory
};
