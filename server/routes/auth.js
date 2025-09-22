const express = require('express');
const auth = require('../middleware/auth');
const authController = require('../controllers/auth');

const router = express.Router();

router.get(
  '/is-logged-in',
  auth.isLoggedIn,
  authController.isLoggedIn,
);
router.get(
  '/logout',
  auth.isLoggedIn,
  authController.logout,
);
module.exports = router;
