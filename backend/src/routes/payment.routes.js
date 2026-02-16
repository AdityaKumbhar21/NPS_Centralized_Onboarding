const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const {
  initiatePaymentController,
  webhookController,
  generatePranController
} = require('../controllers/payment.controller');

router.post('/webhook', webhookController);

router.use(authMiddleware);

router.post('/initiate', initiatePaymentController);
router.post('/generate-pran', generatePranController);

module.exports = router;
