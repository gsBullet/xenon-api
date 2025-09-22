/* eslint-disable eqeqeq */
const constants = require('../constants');
const dao = require('../data');

const isExamAccessible = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const groupId = req.params.groupId || req.query.groupId;

    if (!groupId) {
      res.badRequest({ title: 'Group id not provided' });
      return;
    }
    const group = await dao.group.getById(groupId, true);
    if (!group) {
      res.notFound({ title: 'Group not found' });
      return;
    }
    // eslint-disable-next-line max-len
    const examInThisGroup = group.exams.find((e) => e && e.examId && e.examId._id.toString() == examId);
    if (!examInThisGroup) {
      res.forbidden({ title: 'Exam does not exist in your group' });
      return;
    }
    if (examInThisGroup.status === constants.exam.status.UNPUBLISHED) {
      res.forbidden({ title: 'Exam removed from your group' });
      return;
    }
    req.examInThisGroup = examInThisGroup;
    next();
  } catch (err) {
    if (err.message === constants.errors.NOT_FOUND) {
      res.notFound('Group not found');
      return;
    }
    res.serverError(err);
  }
};

module.exports = { isExamAccessible };
