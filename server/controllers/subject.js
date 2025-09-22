const dao = require('../data');
const utils = require('../lib/utils');

module.exports = {
  create: async (req, res) => {
    try {
      const subject = await dao.subject.create(req.body);
      res.ok(subject);
    } catch (err) {
      const isDuplicateErr = utils.isDuplicateDocument(err.message);
      if (isDuplicateErr) {
        res.conflict({ title: 'Subject name already exist' });
        return;
      }
      res.serverError(err);
    }
  },
  /**
   * @deprecated
   */
  addCourse: async (req, res) => {
    try {
      const { subjectId, courseId } = req.params;
      const ret = await dao.subject.addSubjectToCourse(
        subjectId, courseId,
      );
      res.ok(ret);
    } catch (err) {
      res.serverError(err);
    }
  },
  getSubjectsByCourseId: async (req, res) => {
    try {
      const subjects = await dao.subject.subjectsByCourseId(req.params.courseId);
      res.ok(subjects);
    } catch (err) {
      res.serverError(err);
    }
  },
  deleteSubjectById: async (req, res) => {
    try {
      const subjects = await dao.subject.deleteSubject(req.params.id);
      res.ok(subjects);
    } catch (err) {
      res.serverError(err);
    }
  },
  updateSubjectById: async (req, res) => {
    try {
      const subjects = await dao.subject.updateSubjectById(req.params.id, req.body);
      res.ok(subjects);
    } catch (err) {
      res.serverError(err);
    }
  },
  getById: async (req, res) => {
    try {
      const { subjectId } = req.params;
      const subject = await dao.subject.getById(subjectId);
      if (!subject) {
        res.notFound({ title: 'Subject not found' });
        return;
      }
      res.ok(subject);
    } catch (err) {
      res.serverError(err);
    }
  },
  reorder: async (req, res) => {
    try {
      const { subjectId } = req.params;
      const { lectures, chapters, questionSolves } = await dao.subject.reorder(subjectId, req.body);
      if (!chapters && !lectures && !questionSolves) {
        res.notFound({ title: 'Subject not found' });
        return;
      }
      res.ok({ lectures, chapters });
    } catch (err) {
      res.serverError(err);
    }
  },
  start: async (req, res) => {
    try {
      const completion = await dao.completion.create({
        ...req.body,
        studentId: req.user.id,
      });
      res.ok(completion);
    } catch (err) {
      const isDuplicateErr = utils.isDuplicateDocument(err.message);
      if (isDuplicateErr) {
        res.conflict({ title: 'Already started' });
        return;
      }
      res.serverError(err);
    }
  },
};
