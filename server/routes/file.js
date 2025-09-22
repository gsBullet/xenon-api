const express = require('express');
const fileController = require('../controllers/file');
const auth = require('../middleware/auth');

const router = express.Router();

router.get(
  '/all',
  auth.isLoggedIn,
  auth.authorizeModerator,
  fileController.getFiles,
);
module.exports = router;
