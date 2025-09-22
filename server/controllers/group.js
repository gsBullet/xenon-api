/* eslint-disable no-underscore-dangle */
const moment = require("moment");
const constants = require("../constants");
const dao = require("../data");
const notificationSender = require("../lib/notification");
const utils = require("../lib/utils");
const logger = require("../lib/winston");

module.exports = {
  create: async (req, res) => {
    try {
      const group = await dao.group.create(req.body);
      res.ok(group);
    } catch (err) {
      const isDuplicateErr = utils.isDuplicateDocument(err.message);
      if (isDuplicateErr) {
        res.conflict({ title: "Group name already exist" });
        return;
      }
      res.serverError(err);
    }
  },
  updateGroupNameImage: async (req, res) => {
    try {
      const group = await dao.group.updateGroupNameImage(req.body);
      if (!group) {
        res.notFound({ title: "Group not found" });
        return;
      }
      res.ok(group);
    } catch (err) {
      res.serverError(err);
    }
  },
  getById: async (req, res) => {
    try {
      const isStudent = req.user.roles.includes(
        constants.student.roles.STUDENT
      );
      const group = await dao.group.getById(req.params.groupId, !isStudent);
      res.ok(group);
    } catch (err) {
      res.serverError(err);
    }
  },
  getAll: async (req, res) => {
    try {
      const { session, courseId } = req.params;
      const groups = await dao.group.getAll(session, courseId);
      res.ok(groups);
    } catch (err) {
      res.serverError(err);
    }
  },
  allStudents: async (req, res) => {
    try {
      const { groupId } = req.params;
      const students = await dao.student.studentsByGroupId(groupId);
      res.ok(students);
    } catch (err) {
      res.serverError(err);
    }
  },
  revokeStudent: async (req, res) => {
    try {
      const { groupId } = req.params;
      const { usernames } = req.body;
      const ret = await dao.student.removeGroupForStudent(usernames, groupId);
      if (ret.nModified) {
        await dao.group.updateCounterOfStudent(groupId, -1 * ret.nModified);
      }
      res.ok({ title: "success" });
    } catch (err) {
      res.serverError(err);
    }
  },
  addStudent: async (req, res) => {
    try {
      const { usernames } = req.body;
      const { id: groupId } = req.params;
      const groupData = await dao.group.getById(groupId);
      if (!groupData) {
        res.notFound({ title: "Group not found" });
        return;
      }

      const {
        group,
        student: { nModified },
      } = await dao.student.addGroupForStudent(
        usernames,
        groupId,
        groupData.courseId
      );

      const { notification } = await dao.notification.create({
        students: usernames,
        message: `You have been added to ${group.name} group`,
        type: constants.notification.type.NOTIFICATION,
        info: {
          id: groupId,
          action: constants.notification.action.ADDED,
          on: "group",
        },
      });
      notificationSender.notifyUsers(usernames, notification);
      const text = nModified > 1 ? "students" : "student";
      res.ok({
        title: `${nModified} ${text} added to the group`,
        ...group,
        added: nModified,
      });
    } catch (err) {
      res.serverError(err);
    }
  },
  updateAccessStatus: async (req, res) => {
    try {
      let { status } = req.query;
      const { groupId } = req.params;
      const { chapterId, lectureId, questionSolveId } = req.query;

      status = status || false;
      let cnt = 0;
      if (chapterId) cnt += 1;
      if (lectureId) cnt += 1;
      if (questionSolveId) cnt += 1;

      if (cnt > 1) {
        res.badRequest({ title: "You can only send one argument" });
        return;
      }
      if (!cnt) {
        res.badRequest({
          title:
            "chapterId, questionSolveId and lectureId all of them can't be empty",
        });
        return;
      }
      let group;
      if (chapterId) {
        group = await dao.group.updateAccessStatusOfChapter(
          chapterId,
          groupId,
          status
        );
      } else if (lectureId) {
        group = await dao.group.updateAccessStatusOfLecture(
          lectureId,
          groupId,
          status
        );
      } else if (questionSolveId) {
        group = await dao.group.updateAccessStatusOfQuestionSolve(
          questionSolveId,
          groupId,
          status
        );
      }
      if (!group) {
        if (questionSolveId) {
          res.notFound({ title: "Question solution not found" });
          return;
        }
        const field = chapterId ? "Chapter" : "Lecture";
        res.notFound({ title: `${field} not found` });
        return;
      }
      res.ok(group);
    } catch (err) {
      res.serverError(err);
    }
  },
  addExamAccess: async (req, res) => {
    try {
      const { id, id: groupId } = req.params;
      const { hsc, ssc } = req.query;
      const { examId } = req.body;
      let { endsAt } = req.body;
      const group = await dao.group.addExamAccess(id, {
        ...req.body,
        hsc,
        ssc,
      });
      if (!endsAt) {
        const ahead = moment(new Date()).add(10, "years");
        endsAt = new Date(ahead).valueOf();
      }
      const ok = await dao.examResult.scheduleExam(examId, groupId, endsAt);
      logger.info(
        `New exam: ${examId} scheduled in redis for group: ${groupId}, status: ${ok}`
      );
      if (!group) {
        res.notFound({ title: "Group not found" });
        return;
      }
      const students = await dao.student.studentsByGroupId(id);
      if (students) {
        const studentList = students.map((s) => s.username);
        const { notification } = await dao.notification.create({
          students: studentList,
          message: `You have a new exam in group ${group.name}`,
          type: constants.notification.type.NOTIFICATION,
          info: {
            action: constants.notification.action.ADDED,
            on: "exam",
            id: req.body.examId,
            isPracticeExam: req.body.type === constants.exam.type.PRACTICE,
          },
        });
        notificationSender.notifyUsers(studentList, notification);
      }
      res.ok(group);
    } catch (err) {
      res.serverError(err);
    }
  },
  removeExamAccess: async (req, res) => {
    try {
      const { id, examId } = req.params;
      const exam = await dao.group.removeExamAccess(id, examId);
      res.ok(exam);
    } catch (err) {
      res.serverError(err);
    }
  },
  updateExam: async (req, res) => {
    try {
      const { examId, groupId } = req.params;
      const [exam] = await Promise.all([
        dao.group.updateExam(examId, groupId, req.body),
      ]);
      if (!exam) {
        res.notFound({ title: "Exam not found" });
        return;
      }
      res.ok(exam);
    } catch (err) {
      res.serverError(err);
    }
  },
};
