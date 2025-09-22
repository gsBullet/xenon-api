const express = require("express");
const adminValidator = require("../middleware/request/validator/admin");
const adminController = require("../controllers/admin");
const auth = require("../middleware/auth");

const router = express.Router();
router.get(
  "/",
  auth.isLoggedIn,
  auth.authorizeAdmin,
  adminController.allAdmins
);
router.post("/otp", adminValidator.getOpt, adminController.getOtp);
router.post(
  "/verify-login",
  adminValidator.verifyLogin,
  adminController.verifyLogin
);

router.post(
  "/add",
  auth.isLoggedIn,
  auth.authorizeAdmin,
  adminValidator.addAdmin,
  adminController.addAdmin
);
router.delete(
  "/delete/:username",
  auth.isLoggedIn,
  auth.authorizeAdmin,
  adminController.deleteAdmin
);
router.patch(
  "/update/:id",
  auth.isLoggedIn,
  auth.authorizeAdmin,
  adminValidator.updateAdmin,
  adminController.updateAdmin
);
router.post(
  "/get-all-senior-mentors",
  auth.isLoggedIn,
  auth.authorizeAdmin,
  adminController.getAllSeniorMentors
);

router.post(
  "/get-all-mentors",
  auth.isLoggedIn,
  auth.authorizeAdmin,
  adminController.getAllMentors
);

// router.post(
//   '/login',
//   adminController.login,
// );
router.patch(
  "/register/:id",
  adminValidator.register,
  adminController.register
);
router.patch(
  "/reset-passowrd",
  auth.isLoggedIn,
  adminValidator.resetPassword,
  adminController.resetPassword
);
module.exports = router;
