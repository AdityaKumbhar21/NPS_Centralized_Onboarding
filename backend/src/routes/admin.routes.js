const express = require('express');
const router = express.Router();

const adminMiddleware = require('../middlewares/admin.middleware');
const {
  getAnalyticsController,
  getKycReportController,
  getDropoffController
} = require('../controllers/admin.controller');

router.use(adminMiddleware);

router.get('/analytics', getAnalyticsController);
router.get('/kyc-report', getKycReportController);
router.get('/dropoffs', getDropoffController);

module.exports = router;
