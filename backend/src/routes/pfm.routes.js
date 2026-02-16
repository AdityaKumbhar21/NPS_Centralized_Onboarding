const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const {
  listPfms,
  comparePfms,
  selectPfm
} = require('../controllers/pfm.controller');

router.use(authMiddleware);

router.get('/list', listPfms);
router.get('/compare', comparePfms);
router.post('/select', selectPfm);

module.exports = router;
