const {
  initiatePayment,
  handleWebhook,
  generatePran
} = require('../services/payment.service');

const prisma = require('../config/database');

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

    if (!user || user.onboardingStep !== 'PFM_SELECTED') {
      return res.status(400).json({
        message: 'Complete PFM selection before payment'
      });
    }

    const order = await initiatePayment(userId, amount);

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
