const express = require('express');
const notificationController = require('../controllers/notification');
const auth = require('../middleware/auth');
const notificationValidator = require('../middleware/request/validator/notification');

const router = express.Router();

router.post(
  '/',
  auth.isLoggedIn,
  auth.authorizeModerator,
  notificationValidator.create,
  notificationController.create,
);
router.get(
  '/id/:id/',
  auth.isLoggedIn,
  notificationController.getById,
);
router.patch(
  '/seen/:id',
  auth.isLoggedIn,
  auth.isStudent,
  notificationController.seenHandle,
);
router.delete(
  '/id/:nid/',
  auth.isLoggedIn,
  auth.isStudent,
  notificationController.deleteNotificationFromStudent,
);
module.exports = router;
