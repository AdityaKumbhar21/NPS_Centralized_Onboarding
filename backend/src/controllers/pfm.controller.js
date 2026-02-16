const axios = require('axios');
const prisma = require('../config/database');
const redisClient = require('../config/redis');
const { emitEvent } = require('../services/event.service');

const listPfms = async (req, res, next) => {
  try {
    let pfms = await redisClient.get('pfms');

    if (!pfms) {
      pfms = JSON.stringify([
        { id: 1, name: 'PFM1', returns: 10, risk: 'low', aum: 1000, rating: 4 },
        { id: 2, name: 'PFM2', returns: 12, risk: 'medium', aum: 2000, rating: 5 }
      ]);

      await redisClient.setEx('pfms', 86400, pfms);
    }

    res.status(200).json(JSON.parse(pfms));

  } catch (err) {
    next(err);
  }
};

const comparePfms = async (req, res, next) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({ message: 'PFM ids required' });
    }

    const idArray = ids.split(',').map(Number);

    let pfms = await redisClient.get('pfms');
    pfms = JSON.parse(pfms || '[]');

    const selected = pfms.filter(p => idArray.includes(p.id));

    res.status(200).json({ comparison: selected });

  } catch (err) {
    next(err);
  }
};

const selectPfm = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { pfmId, allocationE = 0, allocationC = 0, allocationG = 0, allocationA = 0 } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.onboardingStep !== 'PROFILE_COMPLETED') {
      return res.status(400).json({
        message: 'Complete profile before selecting PFM'
      });
    }

    const totalAllocation =
      Number(allocationE) +
      Number(allocationC) +
      Number(allocationG) +
      Number(allocationA);

    if (totalAllocation !== 100) {
      return res.status(400).json({
        message: 'Total allocation must equal 100%'
      });
    }

    await prisma.pfmSelection.upsert({
      where: { userId },
      update: {
        pfmId,
        allocationE,
        allocationC,
        allocationG,
        allocationA
      },
      create: {
        userId,
        pfmId,
        allocationE,
        allocationC,
        allocationG,
        allocationA
      }
    });

    await prisma.user.update({
      where: { id: userId },
      data: { onboardingStep: 'PFM_SELECTED' }
    });

    await emitEvent('PFM_SELECTED', { userId, pfmId });

    res.status(200).json({ message: 'PFM selected successfully' });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  listPfms,
  comparePfms,
  selectPfm
};
