const axios = require('axios');
const prisma = require('../config/database');
const redisClient = require('../config/redis');
const { emitEvent } = require('../services/event.service');

const listPfms = async (req, res, next) => {
  try {
    let pfms = await redisClient.get('pfms');

    if (!pfms) {
      const pfmData = [
        {
          id: 1,
          name: 'SBI Pension Funds Pvt. Ltd.',
          tag: 'Recommended',
          returns3Y: '14.2%',
          aum: '45,210',
          risk: 'Moderate High',
          riskColor: 'bg-amber-100 text-amber-800'
        },
        {
          id: 2,
          name: 'HDFC Pension Management Co. Ltd.',
          tag: 'Top Performer (Equity)',
          returns3Y: '14.8%',
          aum: '32,180',
          risk: 'High Risk',
          riskColor: 'bg-red-100 text-red-800'
        },
        {
          id: 3,
          name: 'LIC Pension Fund Ltd.',
          tag: 'Stable Growth History',
          returns3Y: '11.5%',
          aum: '85,440',
          risk: 'Moderate Low',
          riskColor: 'bg-emerald-100 text-emerald-800'
        },
        {
          id: 4,
          name: 'UTI Retirement Solutions Ltd.',
          tag: 'Legacy Fund',
          returns3Y: '12.1%',
          aum: '28,900',
          risk: 'Moderate',
          riskColor: 'bg-blue-100 text-blue-800'
        },
        {
          id: 5,
          name: 'ICICI Prudential Pension Fund Mgmt.',
          tag: 'Balanced',
          returns3Y: '13.6%',
          aum: '38,750',
          risk: 'Moderate',
          riskColor: 'bg-blue-100 text-blue-800'
        },
        {
          id: 6,
          name: 'Kotak Mahindra Pension Fund Ltd.',
          tag: 'Growth Focus',
          returns3Y: '13.9%',
          aum: '21,300',
          risk: 'Moderate High',
          riskColor: 'bg-amber-100 text-amber-800'
        },
        {
          id: 7,
          name: 'Aditya Birla Sun Life Pension Mgmt.',
          tag: 'Conservative Choice',
          returns3Y: '11.8%',
          aum: '15,600',
          risk: 'Low',
          riskColor: 'bg-emerald-100 text-emerald-800'
        }
      ];
      pfms = JSON.stringify(pfmData);
      await redisClient.setEx('pfms', 86400, pfms);
    }

    res.status(200).json({ pfms: JSON.parse(pfms) });

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
    const { pfmId, allocationE = 50, allocationC = 30, allocationG = 20, allocationA = 0 } = req.body;

    if (!pfmId) {
      return res.status(400).json({ message: 'PFM ID is required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Relax step guard — allow PFM select from any authenticated user who hasn't paid yet
    const blockedSteps = ['PAYMENT_COMPLETED', 'PRAN_GENERATED'];
    if (blockedSteps.includes(user.onboardingStep)) {
      return res.status(400).json({ message: 'PFM already selected and payment done' });
    }

    // Normalise provided allocations so they always sum to 100
    const rawE = Number(allocationE);
    const rawC = Number(allocationC);
    const rawG = Number(allocationG);
    const rawA = Number(allocationA);
    const total = rawE + rawC + rawG + rawA;
    const scaleAlloc = (v) => total > 0 ? Math.round((v / total) * 100) : 0;
    const normE = scaleAlloc(rawE);
    const normC = scaleAlloc(rawC);
    const normG = scaleAlloc(rawG);
    // absorb rounding remainder into G
    const normA = 100 - normE - normC - normG;

    await prisma.pfmSelection.upsert({
      where: { userId },
      update: {
        pfmId,
        allocationE: normE,
        allocationC: normC,
        allocationG: normG,
        allocationA: normA
      },
      create: {
        userId,
        pfmId,
        allocationE: normE,
        allocationC: normC,
        allocationG: normG,
        allocationA: normA
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
