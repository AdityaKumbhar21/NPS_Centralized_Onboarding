const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const kycController = require('../controllers/kyc.controller');

// ─── PUBLIC routes (no auth) ──────────────────────────────────────────────────
router.post('/aadhaar/initiate', kycController.initiateAadhaarFlowController);
router.post('/aadhaar/verify', kycController.verifyAadhaarFlowController);

// ─── Protected routes (require JWT) ──────────────────────────────────────────
router.use(authMiddleware);
router.post('/aadhaar', kycController.initiateAadhaarController);
router.post('/pan', kycController.verifyPanController);
router.post('/video/start', kycController.startVideoKycController);
router.post('/video/complete', kycController.completeVideoKycController);
router.get('/status', kycController.getKycStatusController);
router.get('/details', kycController.getKycDetailsController);

module.exports = router;
