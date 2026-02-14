const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const kycController = require('../controllers/kyc.controller');

router.post('/aadhaar', authMiddleware, kycController.initiateAadhaarController);
router.post('/pan', authMiddleware, kycController.verifyPanController);
router.get('/status', authMiddleware, kycController.getKycStatusController);
router.get('/details', authMiddleware, kycController.getKycDetailsController);

module.exports = router;
