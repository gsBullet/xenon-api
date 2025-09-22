const express = require("express");
const auth = require("../middleware/auth");
const qaController = require("../controllers/qa");
const router = express.Router();

router.post("/add-question", auth.isLoggedIn, qaController.addQuestion);
router.patch("/update-question", auth.isLoggedIn, qaController.updateQuestion);
router.post("/get-questions", auth.isLoggedIn, qaController.getQuestions);
router.get("/get-question/:id", auth.isLoggedIn, qaController.getQuestion);
router.post("/search-questions", auth.isLoggedIn, qaController.searchQuestions);
router.delete(
  "/delete-question/:id",
  auth.authorizeAdmin,
  auth.isLoggedIn,
  qaController.deleteQuestion
);
router.get(
  "/get-subject-by-group-by-student",
  auth.isLoggedIn,
  qaController.getSubjectByGroupByStudent
);

router.post("/add-answer", auth.isLoggedIn, qaController.addAnswer);
router.get("/get-answers", auth.isLoggedIn, qaController.getAnswers);
router.get("/get-answer/:id", auth.isLoggedIn, qaController.getAnswer);
router.delete("/delete-answer/:id", auth.isLoggedIn, qaController.deleteAnswer);
router.post("/upvote-answer", auth.isLoggedIn, qaController.upvoteAnswer);
router.post("/update-status", auth.isLoggedIn, qaController.updateStatus);
router.get("/get-upvotes", auth.isLoggedIn, qaController.getUpvotes);
router.get("/get-likes", auth.isLoggedIn, qaController.getLikes);
router.post("/like-question", auth.isLoggedIn, qaController.likeQuestion);
router.get("/analitycs", auth.isLoggedIn, qaController.getAnalytics);
router.post("/set-push-token", auth.isLoggedIn, qaController.setPushToken);
router.get(
  "/get-edit-history/:id",
  auth.isLoggedIn,
  qaController.getCommentHistory
);
router.post(
  "/add-subject-to-group",
  auth.isLoggedIn,
  qaController.assignSubjectToGroup
);
router.get(
  "/get-subject-by-group/:groupId",
  auth.isLoggedIn,
  qaController.getSubjectByGroup
);
router.get(
  "/get-answer-statistics",
  auth.isLoggedIn,
  qaController.getAnswerStatictics
);
router.post(
  "/get-question-keyword",
  auth.isLoggedIn,
  qaController.getQuestionKeyWord
);
router.post("/add-comment", auth.isLoggedIn, qaController.addComment);
router.get(
  "/get-comments/:questionId",
  auth.isLoggedIn,
  qaController.getComments
);

router.patch("/update-comment", auth.isLoggedIn, qaController.updateComment);

router.get("/get-comment/:id", auth.isLoggedIn, qaController.getComment);
router.delete(
  "/delete-comment/:id",
  auth.authorizeAdmin,
  auth.isLoggedIn,
  qaController.deleteComment
);
router.post(
  "/add-senior-mentor-subject",
  auth.isLoggedIn,
  qaController.addSeniorMentorSubject
);
router.get(
  "/get-senior-mentor-subjects/:id",
  auth.isLoggedIn,
  qaController.getSeniorMentorSubjects
);

router.get(
  "/get-mentor-chapter/:id",
  auth.isLoggedIn,
  qaController.getMentorChapter
);

router.post(
  "/add-mentor-chapter",
  auth.isLoggedIn,
  qaController.addMentorChapter
);

router.post("/lock-question", auth.isLoggedIn, qaController.lockQuestion);
router.post("/unlock-question", auth.isLoggedIn, qaController.unlockQuestion);
router.post("/forward-question", auth.isLoggedIn, qaController.forwardQuestion);
router.post(
  "/get-locked-questions",
  auth.isLoggedIn,
  qaController.getLockedQuestionByIds
);

router.get(
  "/get-only-senior-mentor-subjects/:id",
  auth.isLoggedIn,
  qaController.getOnlySeniorMentorSubjects
);
router.post(
  "/student-bookmark-question",
  auth.isLoggedIn,
  qaController.studentBookmarkQuestion
);
router.get(
  "/get-bookmarked-questions/:id",
  auth.isLoggedIn,
  qaController.getBookmarkQuestions
);

router.post(
  "/get-student-question-statistics",
  auth.isLoggedIn,
  qaController.getStudentsQuestionStatistics
);

router.post(
  "/get-branch-specific-stat",
  auth.isLoggedIn,
  qaController.getByBranch
);

module.exports = router;
