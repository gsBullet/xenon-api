const dao = require('../data');
const utils = require('../lib/utils');
const constants = require('../constants');
const { notifyUsers } = require('../lib/notification');

module.exports = {
  create: async (req, res) => {
    try {
      const questionSolve = await dao.questionSolve.create(req.body);
      res.ok(questionSolve);
    } catch (err) {
      const isDuplicateErr = utils.isDuplicateDocument(err.message);
      if (isDuplicateErr) {
        res.conflict({ title: 'Question solve title already exist' });
        return;
      }
      res.serverError(err);
    }
  },
  getById: async (req, res) => {
    try {
      const questionSolve = await dao.questionSolve.getById(req.params.id);
      if (!questionSolve) {
        res.notFound({ title: 'Question solution not found' });
        return;
      }
      res.ok(questionSolve);
    } catch (err) {
      res.serverError(err);
    }
  },
  bySubjectId: async (req, res) => {
    try {
      const questionSolves = await dao.questionSolve.getBySubjectId(req.params.subjectId);
      res.ok(questionSolves);
    } catch (err) {
      res.serverError(err);
    }
  },
  updateContentsById: async (req, res) => {
    const { id } = req.params;
    try {
      const questionSolve = await dao.questionSolve.updateContents(id, req.body);
      if (!questionSolve) {
        res.notFound({ title: 'Question solution not found' });
        return;
      }
      res.ok(questionSolve);
    } catch (err) {
      res.serverError(err);
    }
  },
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { questionSolve } = await dao.questionSolve.update(id, req.body);
      if (!questionSolve) {
        res.notFound({ title: 'Question solution not found' });
        return;
      }
      res.ok(questionSolve);
    } catch (err) {
      const isDuplicateErr = utils.isDuplicateDocument(err.message);
      if (isDuplicateErr) {
        res.conflict({ title: 'Question solve title already exist' });
        return;
      }
      res.serverError(err);
    }
  },
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const { questionSolve } = await dao.questionSolve.delete(id);
      if (!questionSolve) {
        res.notFound({ title: 'Question solution not found' });
        return;
      }
      res.ok(questionSolve);
    } catch (err) {
      res.serverError(err);
    }
  },
  removeContents: async (req, res) => {
    try {
      const { questionSolveId } = req.params;
      const questionSolve = await dao.questionSolve.removeContents(questionSolveId, req.body);
      if (!questionSolve) {
        res.notFound({ title: 'Question solution not found' });
        return;
      }
      res.ok(questionSolve);
    } catch (err) {
      res.serverError(err);
    }
  },
  addAccessToGroup: async (req, res) => {
    try {
      const { groupId, questionSolveId } = req.params;
      const questionSolve = await dao.questionSolve.getById(questionSolveId);
      if (!questionSolve) {
        res.notFound({ title: 'Question solution not found' });
        return;
      }
      const group = await dao.group.addQuestionSolveAccess(groupId, questionSolveId);
      if (!group) {
        res.notFound({ title: 'Group not found' });
        return;
      }
      const students = await dao.student.studentsByGroupId(groupId);
      if (students) {
        const studentList = students.map((s) => s.username);
        const { notification } = await dao.notification.create({
          students: studentList,
          message: `One question solution have been added to group ${group.name}`,
          type: constants.notification.type.NOTIFICATION,
          info: {
            action: constants.notification.action.ADDED,
            on: 'questionSolve',
            id: questionSolveId,
            courseId: group.courseId,
            subjectId: questionSolve.subjectId,
          },
        });
        notifyUsers(studentList, notification);
      }
      res.ok(group);
    } catch (err) {
      res.serverError(err);
    }
  },
};
