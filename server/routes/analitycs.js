const express = require('express');
const auth = require('../middleware/auth');
const analitycsController = require('../controllers/analitycs');

const router = express.Router();

router.get(
  '/active-users',
  auth.isLoggedIn,
  auth.authorizeModerator,
  analitycsController.activeUserCount,
);

router.get(
  '/branch-and-admin',
  auth.isLoggedIn,
  auth.authorizeModerator,
  analitycsController.branchAndAdmins,
);

router.get(
  '/group/:courseId/exam/:session',
  auth.isLoggedIn,
  auth.authorizeModerator,
  analitycsController.groupWiseExamByCourseId,
);
router.get(
  '/dashboard/:session/',
  auth.isLoggedIn,
  auth.authorizeModerator,
  analitycsController.dashboard,
);
router.get(
  '/requests-count',
  auth.isLoggedIn,
  auth.authorizeAdmin,
  analitycsController.allRequestCounts,
);
module.exports = router;
