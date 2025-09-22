const { get } = require("mongoose");
const constants = require("../constants");
const questionData = require("../data/qa");
const { data } = require("../lib/winston");
const { update } = require("../data/course");
const {
  assignSubjectToGroup,
  likeQuestion,
  getCommentHistory,
  getStudentsQuestionStatistics,
} = require("../data/impl/mongo/qa");

module.exports = {
  addQuestion: async (req, res) => {
    try {
      const question = await questionData.addQuestion(req.body);
      res.status(201).send({
        status: "200",
        data: question,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },
  updateQuestion: async (req, res) => {
    try {
      const question = await questionData.updateQuestion({
        ...req.body,
        studentId: req.user.id,
      });
      res.status(200).send({
        status: "200",
        data: question,
      });
    } catch (error) {
      res.status.status(400).send({
        status: "400",
        message: error.message,
      });
    }
  },
  getQuestions: async (req, res) => {
    const roles = req.user.roles;
    console.log("roles", roles);
    let mentorId = undefined;
    if (roles.includes(constants.admin.roles.MENTOR)) mentorId = req.user.id;
    if (roles.includes(constants.admin.roles.ADMIN) && req.body.mentorId)
      mentorId = req.body.mentorId;
    try {
      const questions = await questionData.getQuestions({
        ...req.body,
        roles: req.user.roles,
        mentorId: mentorId,
      });
      res.status(200).send({
        status: "200",
        data: questions,
      });
    } catch (error) {
      console.log("error", error);
      res.status(400).send(error);
    }
  },
  getQuestion: async (req, res) => {
    try {
      const question = await questionData.getQuestion(
        req.params.id,
        req.user.id,
        req.user.roles.includes(constants.student.roles.STUDENT)
          ? "Student"
          : "Admin"
      );
      res.status(200).send({
        status: "200",
        data: question,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },
  deleteQuestion: async (req, res) => {
    try {
      const isAdmin = req.user.roles.includes(constants.admin.roles.ADMIN);
      if (!isAdmin) {
        throw new Error("You are not authorized to delete this question");
      }
      const question = await questionData.deleteQuestion(req.params.id);
      res.status(200).send({
        status: "200",
        data: question,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },
  searchQuestions: async (req, res) => {
    try {
      const questions = await questionData.searchQuestions({
        ...req.body,
        studentId: req.user.id,
      });
      res.status(200).send({
        status: "200",
        data: questions,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },
  getSubjectByGroupByStudent: async (req, res) => {
    try {
      const subject = await questionData.getSubjectByGroupByStudent(
        req.user.id
      );
      res.status(200).send({
        status: "200",
        data: subject,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },
  getBookmarkQuestions: async (req, res) => {
    try {
      const questions = await questionData.getBookmarkQuestions(req.params.id);
      res.status(200).send({
        status: "200",
        data: questions,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  getStudentsQuestionStatistics: async (req, res) => {
    try {
      const statistics = await questionData.getStudentsQuestionStatistics(
        req.body
      );
      res.status(200).send({
        status: "200",
        data: statistics,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  getByBranch: async (req, res) => {
    try {
      const questions = await questionData.getByBranch(req.body);
      res.status(200).send({
        status: "200",
        data: questions,
      });
    } catch (error) {
      res.status.status(400).send({
        status: "400",
        message: error.message,
      });
    }
  },

  addAnswer: async (req, res) => {
    try {
      const answer = await questionData.addAnswer(req.body);
      res.status(201).send({
        status: "200",
        data: answer,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },
  getAnswer: async (req, res) => {
    try {
      const answer = await questionData.getAnswer(req.params.id);
      res.status(200).send({
        status: "200",
        data: answer,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },
  assignSubjectToGroup: async (req, res) => {
    try {
      const subject = await questionData.addSubjectsToGroup(req.body);
      res.status(201).send({
        status: "200",
        data: subject,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },
  getSubjectByGroup: async (req, res) => {
    try {
      const subject = await questionData.getSubjectByGroup(req.params.groupId);
      res.status(200).send({
        status: "200",
        data: subject,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },
  getCommentHistory: async (req, res) => {
    try {
      const comments = await questionData.getCommentHistory(req.params.id);
      res.status(200).send({
        status: "200",
        data: comments,
      });
    } catch (error) {
      res.status(400).send({
        status: "400",
        message: error.message,
      });
    }
  },
  getAnswers: async (req, res) => {
    try {
      const answers = await questionData.getAnswers(req.params.questionId);
      res.status(200).send({
        status: "200",
        data: answers,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },
  deleteAnswer: async (req, res) => {
    try {
      const answer = await questionData.deleteAnswer(req.params.id);
      res.status(200).send({
        status: "200",
        data: answer,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },
  upvoteAnswer: async (req, res) => {
    try {
      const answer = await questionData.upvoteAnswer({
        ...req.body,
        userId: req.user.id,
        userType: req.user.roles.includes(constants.student.roles.STUDENT)
          ? "Student"
          : "Admin",
      });
      res.status(200).send({
        status: "200",
        data: answer,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },
  updateStatus: async (req, res) => {
    try {
      const question = await questionData.updateStatus({
        ...req.body,
        userId: req.user.id,
        roles: req.user.roles,
      });
      res.status(200).send({
        status: "200",
        data: question,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },
  getQuestionKeyWord: async (req, res) => {
    try {
      const isStudent = req.user.roles.includes(
        constants.student.roles.STUDENT
      );
      const isAdmin = req.user.roles.includes(constants.admin.roles.ADMIN);
      const questions = await questionData.getQuestionKeyWord(
        req.body.searchString,
        isStudent ? "Student" : "Admin",
        req.user.id,
        isAdmin
      );
      res.status(200).send({
        status: "200",
        data: questions,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },
  getUpvotes: async (req, res) => {
    try {
      const upvotes = await questionData.getUpvotes({
        userId: req.user.id,
        userType: req.user.roles.includes(constants.student.roles.STUDENT)
          ? "Student"
          : "Admin",
      });
      res.status(200).send({
        status: "200",
        data: upvotes,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  likeQuestion: async (req, res) => {
    try {
      const like = await questionData.likeQuestion({
        ...req.body,
        userId: req.user.id,
        userType: req.user.roles.includes(constants.student.roles.STUDENT)
          ? "Student"
          : "Admin",
      });
      res.status(201).send({
        status: "200",
        data: like,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },
  getLikes: async (req, res) => {
    try {
      const likes = await questionData.getLikes({
        userId: req.user.id,
        userType: req.user.roles.includes(constants.student.roles.STUDENT)
          ? "Student"
          : "Admin",
      });
      res.status(200).send({
        status: "200",
        data: likes,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  getAnalytics: async (req, res) => {
    try {
      const analytics = await questionData.getAnalytics();
      res.status(200).send({
        status: "200",
        data: analytics,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },
  setPushToken: async (req, res) => {
    try {
      const pushToken = await questionData.setPushToken({
        ...req.body,
        userId: req.user.id,
        userType: req.user.roles.includes(constants.student.roles.STUDENT)
          ? "Student"
          : "Admin",
      });
      res.status(200).send({
        status: "200",
        data: pushToken,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },
  getAnswerStatictics: async (req, res) => {
    try {
      const answerStatistics = await questionData.getAnswerStatictics();
      res.status(200).send({
        status: "200",
        data: answerStatistics,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  addComment: async (req, res) => {
    try {
      const comment = await questionData.addComment(req.body);
      res.status(201).send({
        status: "200",
        data: comment,
      });
    } catch (error) {
      res.status(400).send({
        status: "400",
        message: error.message,
      });
    }
  },
  updateComment: async (req, res) => {
    try {
      const comment = await questionData.updateComment({
        ...req.body,
        userId: req.user.id,
        roles: req.user.roles,
      });
      res.status(200).send({
        status: "200",
        data: comment,
      });
    } catch (error) {
      res.status(400).send({
        status: "400",
        message: error.message,
      });
    }
  },
  getComment: async (req, res) => {
    try {
      const comment = await questionData.getComment(req.params.id);
      res.status(200).send({
        status: "200",
        data: comment,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },
  getComments: async (req, res) => {
    try {
      const comments = await questionData.getComments(req.params.questionId);
      res.status(200).send({
        status: "200",
        data: comments,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },
  deleteComment: async (req, res) => {
    try {
      //check if the user is an admin
      // const isAdmin = req.user.roles.includes(constants.admin.roles.ADMIN);
      // if (!isAdmin) {
      //   throw new Error("You are not authorized to delete this comment");
      // }
      const comment = await questionData.deleteComment({
        id: req.params.id,
        userId: req.user.id,
        roles: req.user.roles,
      });
      res.status(200).send({
        status: "200",
        data: comment,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },
  addSeniorMentorSubject: async (req, res) => {
    try {
      const mentorSubject = await questionData.addSeniorMentorSubject(req.body);
      res.status(201).send({
        status: "200",
        data: mentorSubject,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },
  getSeniorMentorSubjects: async (req, res) => {
    try {
      console.log("req.params.id", req.params.id);
      const mentorSubjects = await questionData.getSeniorMentorSubjects(
        req.params.id,
        req.user.roles.includes(constants.admin.roles.ADMIN)
      );
      res.status(200).send({
        status: "200",
        data: mentorSubjects,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  getOnlySeniorMentorSubjects: async (req, res) => {
    try {
      const mentorSubjects = await questionData.getOnlySeniorMentorSubjects(
        req.params.id
      );
      res.status(200).send({
        status: "200",
        data: mentorSubjects,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  studentBookmarkQuestion: async (req, res) => {
    try {
      const bookmark = await questionData.studentBookmarkQuestion(req.body);
      res.status(201).send({
        status: "200",
        data: bookmark,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  getMentorChapter: async (req, res) => {
    try {
      const mentorChapter = await questionData.getMentorChapter(req.params.id);
      res.status(200).send({
        status: "200",
        data: mentorChapter,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  addMentorChapter: async (req, res) => {
    try {
      const mentorChapter = await questionData.addMentorChapter(req.body);
      res.status(201).send({
        status: "200",
        data: mentorChapter,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  lockQuestion: async (req, res) => {
    try {
      const question = await questionData.lockQuestion(req.body);
      res.status(200).send({
        status: "200",
        data: question,
      });
    } catch (error) {
      console.log("error", error);
      res.status(400).send({
        status: "400",
        message: error.message,
      });
    }
  },

  unlockQuestion: async (req, res) => {
    try {
      const question = await questionData.unlockQuestion({
        ...req.body,
        userId: req.user.id,
        roles: req.user.roles,
      });
      res.status(200).send({
        status: "200",
        data: question,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },
  getLockedQuestionByIds: async (req, res) => {
    try {
      const questions = await questionData.getLockedQuestionByIds(req.body.ids);
      res.status(200).send({
        status: "200",
        data: questions,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  },
  forwardQuestion: async (req, res) => {
    try {
      const question = await questionData.forwardQuestion({
        ...req.body,
        userId: req.user.id,
        roles: req.user.roles,
      });
      res.status(200).send({
        status: "200",
        data: question,
      });
    } catch (error) {
      res.status(400).send({
        status: "400",
        message: error.message,
      });
    }
  },
};
