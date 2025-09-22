const { get } = require("mongoose");
const questionMongoImpl = require("./impl/mongo/qa");
const { student } = require("../constants");
const { search } = require("../routes/qa");
const { updateStatus } = require("./student");
const {
  setPushToken,
  getSubjectByGroup,
  likeQuestion,
  getCommentHistory,
  getStudentsQuestionStatistics,
} = require("../controllers/qa");
const { add } = require("../lib/winston");
const { update } = require("./course");

module.exports = {
  addQuestion: async (data) => questionMongoImpl.create(data),
  updateQuestion: async (data) => questionMongoImpl.update(data),
  getQuestions: async (data) => questionMongoImpl.getQuestions(data),
  getQuestion: async (id, userId, userType) =>
    questionMongoImpl.getQuestion(id, userId, userType),
  deleteQuestion: async (id) => questionMongoImpl.deleteQuestion(id),
  searchQuestions: async (data) => questionMongoImpl.searchQuestions(data),
  getSubjectByGroupByStudent: async (studentId) =>
    questionMongoImpl.getGroupSubjectByStudent(studentId),
  addAnswer: async (data) => questionMongoImpl.createAnswer(data),
  getStudentsQuestionStatistics: async (data) =>
    questionMongoImpl.getStudentsQuestionStatistics(data),
  getByBranch: async (data) => questionMongoImpl.getByBranch(data),
  getAnswers: async (data) => questionMongoImpl.getAnswers(data),
  getAnswer: async (id) => questionMongoImpl.getAnswer(id),
  deleteAnswer: async (id) => questionMongoImpl.deleteAnswer(id),
  upvoteAnswer: async (data) => questionMongoImpl.upvoteAnswer(data),
  getUpvotes: async (data) => questionMongoImpl.getUpvotes(data),
  getLikes: async (data) => questionMongoImpl.getLikes(data),
  likeQuestion: async (data) => questionMongoImpl.likeQuestion(data),
  getAnalytics: async () => questionMongoImpl.getAnalytics(),
  setPushToken: async (data) => questionMongoImpl.setPushToken(data),
  getAnswerStatictics: async () => questionMongoImpl.getAnswerStatictics(),
  addComment: async (data) => questionMongoImpl.createComment(data),
  getComments: async (questionId) => questionMongoImpl.getComments(questionId),
  getComment: async (id) => questionMongoImpl.getComment(id),
  updateComment: async (data) => questionMongoImpl.updateComment(data),
  deleteComment: async (data) => questionMongoImpl.deleteComment(data),
  addSeniorMentorSubject: async (data) =>
    questionMongoImpl.addSeniorMentorSubjects(data),
  updateStatus: async (data) => questionMongoImpl.updateStatus(data),
  addSubjectsToGroup: async (data) =>
    questionMongoImpl.assignSubjectToGroup(data),
  getSubjectByGroup: async (groupId) =>
    questionMongoImpl.getSubjectByGroup(groupId),
  getQuestionKeyWord: async (searchString, userType, userId, isAdmin) =>
    questionMongoImpl.getQuestionKeyWord(
      searchString,
      userType,
      userId,
      isAdmin
    ),
  getCommentHistory: async (id) => questionMongoImpl.getCommentHistory(id),
  studentBookmarkQuestion: async (data) =>
    questionMongoImpl.bookmarkQuestion(data),
  getBookmarkQuestions: async (studentId) =>
    questionMongoImpl.getBookmarkQuestions(studentId),
  getSeniorMentorSubjects: async (mentorId, isAdmin) =>
    questionMongoImpl.getSeniorMentorSubjects(mentorId, isAdmin),
  getOnlySeniorMentorSubjects: async (mentorId) =>
    questionMongoImpl.getOnlySeniorMentorSubjects(mentorId),
  getMentorChapter: async (mentorId) =>
    questionMongoImpl.getMentorChapter(mentorId),
  addMentorChapter: async (data) => questionMongoImpl.addMentorChapter(data),
  lockQuestion: async (data) => questionMongoImpl.lockQuestion(data),
  unlockQuestion: async (data) => questionMongoImpl.unlockQuestion(data),
  getLockedQuestionByIds: async (ids) =>
    questionMongoImpl.getLockedQuestionByIds(ids),
  forwardQuestion: async (data) => questionMongoImpl.forwardQuestion(data),
};
