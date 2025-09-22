const express = require("express");
const examValidator = require("../middleware/request/validator/exam");
const examController = require("../controllers/exam");
const auth = require("../middleware/auth");
const student = require("../middleware/student");
const examMiddleware = require("../middleware/exam");

const router = express.Router();

router.get(
  "/export/:examId",
  auth.isLoggedIn,
  auth.authorizeSAIMEM,
  examController.exportCSV
);

router.post(
  "/",
  auth.isLoggedIn,
  auth.authorizeExamModerator,
  examValidator.create,
  examController.create
);
router.patch(
  "/change-exam-type/:id",
  auth.isLoggedIn,
  auth.authorizeExamModerator,
  examController.changeExamType
);
router.patch(
  "/remove-question/:id/:questionId", // ? id => examId
  auth.isLoggedIn,
  auth.authorizeExamModerator,
  examController.removeQuestion
);
router.patch(
  "/add-question/:id/", // ? id => examId
  auth.isLoggedIn,
  auth.authorizeExamModerator,
  examValidator.addQuestion,
  examController.addQuestion
);
router.patch(
  "/update/:id/", // ? id => examId
  auth.isLoggedIn,
  auth.authorizeExamModerator,
  examValidator.update,
  examController.update
);
router.delete(
  "/delete/:id/", // ? id => examId
  auth.isLoggedIn,
  auth.authorizeExamModerator,
  examController.delete
);
router.get(
  "/id/:id/groupId/:groupId", // ? id => examId
  auth.isLoggedIn,
  auth.authorizeSAIMEM,
  examController.getById
);
router.get(
  "/course-id/:courseId",
  auth.isLoggedIn,
  auth.authorizeEMAE,
  examController.getAllExamByCourseId
);
router.patch(
  "/start/:examId/group-id/:groupId/",
  auth.isLoggedIn,
  auth.isStudent,
  student.isAuthorizedToGroup,
  examMiddleware.isExamAccessible,
  examController.startExam
);
router.patch(
  "/add-answer/:examId/group/:groupId/",
  auth.isLoggedIn,
  auth.isStudent,
  student.isAuthorizedToGroup,
  examMiddleware.isExamAccessible,
  examValidator.addAnswer,
  examController.addAnswer
);
router.patch(
  "/submit/:examId/group/:groupId/",
  auth.isLoggedIn,
  auth.isStudent,
  student.isAuthorizedToGroup,
  examMiddleware.isExamAccessible,
  examController.submit
);
router.patch(
  "/mark-answer/:examId/group/:groupId/",
  auth.isLoggedIn,
  auth.authorizeExaminer,
  examValidator.isEvaluatable,
  examValidator.markAnswer,
  examController.markAnswer
);
router.patch(
  "/publish/:examId/student/:studentId/group/:groupId/",
  auth.isLoggedIn,
  auth.authorizeExaminer,
  examValidator.isEvaluatable,
  examController.publish
);
router.get(
  "/result/:id/group-id/:groupId",
  auth.isLoggedIn,
  auth.authorizeExaminer,
  examController.getExamResultByExamId
);
router.get(
  "/result/:examId/student/by-groupId/:groupId", // ? id => examId
  auth.isLoggedIn,
  auth.isStudent,
  examMiddleware.isExamAccessible,
  examController.getExamResultByStudentIdAndExamId
);
router.get(
  "/aggregate/",
  auth.isLoggedIn,
  auth.authorizeModerator,
  examController.aggregate
);
router.patch(
  "/retake/:examId/student-id/:studentId/",
  auth.isLoggedIn,
  auth.isStudent,
  examMiddleware.isExamAccessible,
  examController.retakeExam
);
router.patch(
  "/publish-all/:examId/group/:groupId",
  auth.isLoggedIn,
  auth.authorizeExaminer,
  examValidator.publishAll,
  examValidator.isEvaluatable,
  examController.publishAll
);
router.get(
  "/scoreboard/",
  auth.isLoggedIn,
  auth.isStudent,
  examController.myScoreboard
);
router.get(
  "/scoreboard/:studentId",
  auth.isLoggedIn,
  auth.authorizeAdminType,
  examController.scoreboardByStudentId
);
router.get(
  "/process-submission/:examId/group/:groupId",
  auth.isLoggedIn,
  auth.authorizeAdminType,
  examValidator.isSubmissionProcessable,
  examController.processExam
);

router.post(
  "/add-segmented-exam-subject",
  auth.isLoggedIn,
  auth.isStudent,
  examController.addSegmentedExamSubject
);
router.get(
  "/get-segmented-exam-subject/:examId/:studentId",
  auth.isLoggedIn,
  auth.isStudent,
  examController.getSegmentedExamSubject
);

module.exports = router;
