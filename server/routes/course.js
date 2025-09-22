const express = require("express");
const courseController = require("../controllers/course");
const auth = require("../middleware/auth");
const courseValidator = require("../middleware/request/validator/course");
const student = require("../middleware/student");

const router = express.Router();

router.get(
  "/",
  auth.isLoggedIn,
  auth.authorizeAdminType,
  courseController.courses
);
router.get("/subject", auth.isLoggedIn, courseController.getCourseWithSubject);
router.post(
  "/",
  auth.isLoggedIn,
  auth.authorizeModerator,
  courseValidator.createNewCourse,
  courseController.createNewCourse
);
router.patch(
  "/:id",
  auth.isLoggedIn,
  auth.authorizeModerator,
  courseValidator.updateCourse,
  courseController.updateCourse
);
router.get(
  "/:courseId",
  auth.isLoggedIn,
  student.isEnrolledInCourse,
  courseController.coursesById
);
router.get(
  "/:courseId/subject-completion",
  auth.isLoggedIn,
  auth.isStudent,
  courseController.allSubjectCompletion
);
module.exports = router;
