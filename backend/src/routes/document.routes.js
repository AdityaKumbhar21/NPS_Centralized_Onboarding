const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');

const {
  generateUploadUrlController,
  verifyDocumentController,
  getDocumentStatus
} = require('../controllers/document.controller');


router.use(authMiddleware);

router.post('/upload-url', generateUploadUrlController);
router.post('/verify', verifyDocumentController);
router.get('/status', getDocumentStatus);

module.exports = router;
