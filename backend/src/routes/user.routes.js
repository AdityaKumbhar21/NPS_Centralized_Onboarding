const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');

const {
  savePersonalDetails,
  saveAddress,
  saveNominee,
  getDraft
} = require('../controllers/user.controller');

router.use(authMiddleware);


router.post('/profile/personal', savePersonalDetails);


router.post('/profile/address', saveAddress);


router.post('/profile/nominee', saveNominee);


router.get('/profile/draft', getDraft);

module.exports = router;
