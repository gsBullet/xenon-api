const express = require('express');
const gatewayController = require('../controllers/gateway');
const auth = require('../middleware/auth');
const gatewayValidator = require('../middleware/request/validator/gateway');

const router = express.Router();

router.get(
  '/sms',
  // auth.isLoggedIn,
  // auth.authorizeAdmin,
  gatewayController.getSmsGateway,
);
router.put(
  '/sms',
  // auth.isLoggedIn,
  // auth.authorizeAdmin,
  gatewayValidator.setSmsGateway,
  gatewayController.setSmsGateway,
);
module.exports = router;
