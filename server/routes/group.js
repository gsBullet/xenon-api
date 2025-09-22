const express = require("express");
const groupValidator = require("../middleware/request/validator/group");
const groupController = require("../controllers/group");
const auth = require("../middleware/auth");
const student = require("../middleware/student");

const router = express.Router();

router.post(
  "/",
  auth.isLoggedIn,
  auth.authorizeModerator,
  groupValidator.createNewGroup,
  groupController.create
);
router.patch(
  "/update-group-name-image",
  auth.isLoggedIn,
  auth.authorizeModerator,
  groupController.updateGroupNameImage
);
router.get(
  "/:session/:courseId",
  auth.isLoggedIn,
  auth.authorizeAdminType,
  groupController.getAll
);
router.patch(
  "/remove-student/:groupId/",
  auth.isLoggedIn,
  auth.authorizeModerator,
  groupValidator.removeAddGroupForStudent,
  groupController.revokeStudent
);
router.get(
  "/all/students/:groupId",
  auth.isLoggedIn,
  auth.authorizeModerator,
  groupController.allStudents
);
router.get(
  "/:groupId",
  auth.isLoggedIn,
  student.isAuthorizedToGroup,
  groupController.getById
);
router.patch(
  "/:id/add-student", // id => groupId
  auth.isLoggedIn,
  auth.authorizeModerator,
  groupValidator.removeAddGroupForStudent,
  groupController.addStudent
);
// lecture, chapter, question-solve
router.patch(
  "/:groupId/access-status",
  auth.isLoggedIn,
  auth.authorizeModerator,
  groupController.updateAccessStatus
);
router.patch(
  "/:id/add-exam",
  auth.isLoggedIn,
  auth.authorizeModerator,
  groupValidator.addExam,
  groupController.addExamAccess
);
router.patch(
  "/:id/remove-exam/:examId",
  auth.isLoggedIn,
  auth.authorizeModerator,
  groupController.removeExamAccess
);
router.patch(
  "/:groupId/update/:examId",
  auth.isLoggedIn,
  auth.authorizeModerator,
  groupValidator.updateExam,
  groupController.updateExam
);
module.exports = router;
