const prisma = require('../config/database');

const logEvent = async (eventType, userId, details = {}) => {
  await prisma.analyticsEvent.create({
    data: {
      eventType,
      userId,
      details
    }
  });
};

const getAnalytics = async () => {
  const totalUsers = await prisma.user.count();

  if (totalUsers === 0) {
    return {
      totalUsers: 0,
      kycApprovalRate: 0,
      paymentCompletionRate: 0
    };
  }

  const approvedKyc = await prisma.user.count({
    where: { kycStatus: 'APPROVED' }
  });

  const paymentCompleted = await prisma.user.count({
    where: { onboardingStep: 'PAYMENT_COMPLETED' }
  });

  return {
    totalUsers,
    kycApprovalRate: (approvedKyc / totalUsers) * 100,
    paymentCompletionRate: (paymentCompleted / totalUsers) * 100
  };
};

const getKycReport = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  return await prisma.user.findMany({
    where: { kycStatus: { not: 'NOT_STARTED' } },
    select: {
      id: true,
      mobile: true,
      kycStatus: true,
      onboardingStep: true,
      createdAt: true
    },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' }
  });
};

const getDropoffs = async () => {
  const steps = await prisma.user.groupBy({
    by: ['onboardingStep'],
    _count: { onboardingStep: true }
  });

  return { steps };
};

module.exports = {
  logEvent,
  getAnalytics,
  getKycReport,
  getDropoffs
};
