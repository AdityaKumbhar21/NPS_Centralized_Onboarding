const express = require('express');
const router = express.Router();

const {
  sendOtpController,
  verifyOtpController,
  refreshTokenController,
  logoutController
} = require('../controllers/auth.controller');

const rateLimitMiddleware = require('../middlewares/rate.middleware');
const authMiddleware = require('../middlewares/auth.middleware');



router.post(
  '/send-otp',
  rateLimitMiddleware,
  sendOtpController
);


router.post(
  '/verify-otp',
  rateLimitMiddleware,
  verifyOtpController
);

router.post(
  '/refresh-token',
  refreshTokenController
);

router.post(
  '/logout',
  authMiddleware,
  logoutController
);

module.exports = router;
