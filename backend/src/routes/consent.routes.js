const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const { acceptConsent, getConsentHistory } = require('../controllers/consent.controller');

router.post('/accept', authMiddleware, acceptConsent);
router.get('/history', authMiddleware, getConsentHistory);

module.exports = router;