const express = require("express");
const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const studentController = require("../controllers/student");
const auth = require("../middleware/auth");
const studentValidator = require("../middleware/request/validator/student");
const redis = require("../lib/redis");

const { client } = redis.getClients();

const router = express.Router();
const otpLimiter = rateLimit({
  store: new RedisStore({ client }),
  windowMs: 4 * 60 * 1000, // 4 minutes
  max: 5, // max request 1
  message: {
    status: "429",
    errors: {
      title: "OTP already send, please try again leter",
    },
  },
});
router.get(
  "/export",
  auth.isLoggedIn,
  auth.authorizeModerator,
  studentController.exportCsv
);
router.get(
  "/export/group/:groupId",
  auth.isLoggedIn,
  auth.authorizeModerator,
  studentController.exportCsvByGroupId
);
router.post(
  "/add-student",
  auth.isLoggedIn,
  auth.authorizeModerator,
  studentValidator.addStudent,
  studentController.addStudent
);
router.patch(
  "/add-course",
  auth.isLoggedIn,
  auth.authorizeModerator,
  studentValidator.courseAddRemove,
  studentController.addCourse
);
router.patch(
  "/remove-course",
  auth.isLoggedIn,
  auth.authorizeModerator,
  studentValidator.courseAddRemove,
  studentController.removeCourse
);
router.patch(
  "/status/:id",
  auth.isLoggedIn,
  auth.authorizeModerator,
  studentValidator.updateStatus,
  studentController.updateStatus
);
router.patch(
  "/status/",
  auth.isLoggedIn,
  auth.authorizeModerator,
  studentValidator.updateStatusMultiple,
  studentController.updateStatusMultiple
);
router.get(
  "/",
  auth.isLoggedIn,
  auth.authorizeModerator,
  studentController.allStudents
);
router.get(
  "/otp/:username",
  // otpLimiter,
  studentController.getOtp
);
router.get(
  "/profile",
  auth.isLoggedIn,
  auth.isStudent,
  studentController.profile
);
router.get(
  "/courseByStudent/:id",
  auth.isLoggedIn,
  auth.isStudent,
  studentController.getCourseByStudent
);

router.get(
  "/courseByStudentWithSubjectAndChapter",
  auth.isLoggedIn,
  auth.isStudent,
  studentController.getCourseByStudentWithSubjectAndChapter
);

router.post("/alternateExam", studentController.alternateExam);
router.get("/alternateExam/:username", studentController.getAlternateExam);
router.get("/profileFromDB", studentController.profileFromDB);
router.patch(
  "/profile",
  auth.isLoggedIn,
  auth.isStudent,
  studentValidator.updateProfile,
  studentController.updateProfile
);
router.patch(
  "/profile/:id", // student _id
  auth.isLoggedIn,
  auth.authorizeModerator,
  studentValidator.updateProfileById,
  studentController.updateProfileById
);
router.get(
  "/profile/:id", // student _id
  auth.isLoggedIn,
  auth.authorizeModerator,
  studentController.profileById
);
router.patch(
  "/set-password",
  studentValidator.setPassword,
  studentController.setPassword
);
router.post("/login", studentValidator.login, studentController.login);

router.delete(
  "/delete",
  auth.isLoggedIn,
  auth.authorizeModerator,
  studentController.deleteStudents
);

router.patch("/forgot-password/:username", studentController.forgotPassword);
module.exports = router;
