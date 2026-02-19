const prisma = require('../config/database');

const initiatePayment = async (userId, amount) => {
  if (!amount || amount <= 0) {
    throw new Error('Invalid payment amount');
  }

  const orderId = `order_${Date.now()}_${userId}`;

  await prisma.payment.create({
    data: {
      userId,
      orderId,
      amount,
      status: 'CREATED'
    }
  });

  return {
    orderId,
    redirectUrl: process.env.PAYMENT_GATEWAY_URL
  };
};

const handleWebhook = async (payload) => {
  const { orderId, status } = payload;

  const payment = await prisma.payment.findUnique({
    where: { orderId }
  });

  if (!payment) {
    throw new Error('Invalid order');
  }

  if (payment.status === 'SUCCESS') {
    return { status: 'already_processed' };
  }

  if (status === 'success') {
    await prisma.payment.update({
      where: { orderId },
      data: { status: 'SUCCESS' }
    });

    await prisma.user.update({
      where: { id: payment.userId },
      data: { onboardingStep: 'PAYMENT_COMPLETED' }
    });

    return { status: 'success' };
  }

  await prisma.payment.update({
    where: { orderId },
    data: { status: 'FAILED' }
  });

  return { status: 'failed' };
};

const generatePran = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  // Allow PRAN generation if payment is completed OR already in a post-PFM state
  // (covers simulated / dev flows where webhook never fires)
  const allowedSteps = ['PAYMENT_COMPLETED', 'PFM_SELECTED', 'FATCA_COMPLETED', 'CONSENT_GIVEN', 'PROFILE_COMPLETED'];
  if (!user || !allowedSteps.includes(user.onboardingStep)) {
    throw new Error(`Cannot generate PRAN from step: ${user?.onboardingStep}`);
  }

  const pran = 'PRAN' + Date.now().toString().slice(-8);

  await prisma.user.update({
    where: { id: userId },
    data: {
      pran,
      onboardingStep: 'PRAN_GENERATED'
    }
  });

  return { pran };
};

module.exports = {
  initiatePayment,
  handleWebhook,
  generatePran
};
