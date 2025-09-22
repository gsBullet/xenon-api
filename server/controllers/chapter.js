const constants = require('../constants');
const dao = require('../data');
const { notifyUsers } = require('../lib/notification');
const utils = require('../lib/utils');

module.exports = {
  create: async (req, res) => {
    try {
      const chapter = await dao.chapter.create(req.body);
      res.ok(chapter);
    } catch (err) {
      const isDuplicateErr = utils.isDuplicateDocument(err.message);
      if (isDuplicateErr) {
        res.conflict({ title: 'Chapter name already exist' });
        return;
      }
      res.serverError(err);
    }
  },
  getById: async (req, res) => {
    try {
      const chapter = await dao.chapter.getById(req.params.id);
      if (!chapter) {
        res.notFound({ title: 'Chapter not found' });
        return;
      }
      res.ok(chapter);
    } catch (err) {
      res.serverError(err);
    }
  },
  chaptersBySubjectId: async (req, res) => {
    try {
      const chapters = await dao.chapter.getChaptersBySubjectId(req.params.subjectId);
      res.ok(chapters);
    } catch (err) {
      res.serverError(err);
    }
  },
  updateContentsById: async (req, res) => {
    const { id } = req.params;
    try {
      const chapter = await dao.chapter.updateContents(id, req.body);
      if (!chapter) {
        res.notFound({ title: 'Chapter not found' });
        return;
      }
    } catch (err) {
      res.serverError(err);
    }
  },
  addAccessToGroup: async (req, res) => {
    try {
      const { groupId, chapterId } = req.params;
      const chapter = await dao.chapter.getById(chapterId);
      if (!chapter) {
        res.notFound({ title: 'Chapter not found' });
        return;
      }
      const group = await dao.group.addChapterAccess(groupId, chapterId);
      if (!group) {
        res.notFound({ title: 'Group not found' });
        return;
      }
      const students = await dao.student.studentsByGroupId(groupId);
      if (students) {
        const studentList = students.map((s) => s.username);
        const { notification } = await dao.notification.create({
          students: studentList,
          message: `One chapter have been added to group ${group.name}`,
          type: constants.notification.type.NOTIFICATION,
          info: {
            action: constants.notification.action.ADDED,
            on: 'chapter',
            id: chapterId,
            courseId: group.courseId,
            subjectId: chapter.subjectId,
          },
        });
        notifyUsers(studentList, notification);
      }
      res.ok(group);
    } catch (err) {
      res.serverError(err);
    }
  },
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { chapter } = await dao.chapter.update(id, req.body);
      if (!chapter) {
        res.notFound({ title: 'Chapter not found' });
        return;
      }
      res.ok(chapter);
    } catch (err) {
      res.serverError(err);
    }
  },
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const { chapter } = await dao.chapter.delete(id);
      if (!chapter) {
        res.notFound({ title: 'Chapter not found' });
        return;
      }
      res.ok(chapter);
    } catch (err) {
      res.serverError(err);
    }
  },
  removeContents: async (req, res) => {
    try {
      const { chapterId } = req.params;
      const chapter = await dao.chapter.removeContents(chapterId, req.body);
      if (!chapter) {
        res.notFound({ title: 'Chapter not found' });
        return;
      }
      res.ok(chapter);
    } catch (err) {
      res.serverError(err);
    }
  },
};
