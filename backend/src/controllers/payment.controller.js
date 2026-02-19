const {
  initiatePayment,
  handleWebhook,
  generatePran
} = require('../services/payment.service');

const prisma = require('../config/database');
const { emitEvent } = require('../services/event.service');

const initiatePaymentController = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const userId = req.user.userId;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Relax step guard — block only if already paid or PRAN generated
    const blockedSteps = ['PAYMENT_COMPLETED', 'PRAN_GENERATED'];
    if (!user || blockedSteps.includes(user.onboardingStep)) {
      return res.status(400).json({
        message: 'Payment already completed or invalid state'
      });
    }

    const order = await initiatePayment(userId, amount);

    await emitEvent('PAYMENT_INITIATED', { userId, orderId: order.orderId, amount });

    res.status(200).json(order);

  } catch (err) {
    next(err);
  }
};

const webhookController = async (req, res, next) => {
  try {
    const result = await handleWebhook(req.body);

    res.status(200).json(result);

  } catch (err) {
    next(err);
  }
};

const generatePranController = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // In simulated/dev flow there is no real webhook, so mark payment as completed here
    // if it hasn't been done yet.
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && user.onboardingStep !== 'PAYMENT_COMPLETED' && user.onboardingStep !== 'PRAN_GENERATED') {
      // Upsert a payment record in SUCCESS state
      const existingPayment = await prisma.payment.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      if (existingPayment) {
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: { status: 'SUCCESS' }
        });
      } else {
        await prisma.payment.create({
          data: {
            userId,
            orderId: `order_sim_${Date.now()}_${userId}`,
            amount: 500,
            status: 'SUCCESS'
          }
        });
      }
      await prisma.user.update({
        where: { id: userId },
        data: { onboardingStep: 'PAYMENT_COMPLETED' }
      });
    }

    const data = await generatePran(userId);

    res.status(200).json(data);

  } catch (err) {
    next(err);
  }
};

module.exports = {
  initiatePaymentController,
  webhookController,
  generatePranController
};
