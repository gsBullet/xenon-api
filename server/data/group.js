/* eslint-disable no-underscore-dangle */
const constants = require("../constants");
const groupMongoImpl = require("./impl/mongo/group");
const groupRedisImpl = require("./impl/redis/group");
// const examData = require('./exam');

// ? Don't forget to evict from redis on delete

module.exports = {
  create: async (data) => groupMongoImpl.create(data),
  updateGroupNameImage: async (data) =>
    groupMongoImpl.updateGroupNameImage(data),
  getAll: async (session = "", courseId = "") =>
    groupMongoImpl.getAll(session, courseId),
  getById: async (id, safe = false) => {
    // TODO: check error
    let group = await groupRedisImpl.get(id);
    if (!group) group = await groupMongoImpl.getById(id);
    const groupJO = JSON.stringify(group);
    group = JSON.parse(groupJO);
    if (!safe && group) {
      const lectures = group.lectures.filter((l) => l.showStatus === true);
      const chapters = group.chapters.filter((c) => c.showStatus === true);
      const questionSolves = group.questionSolves
        ? group.questionSolves.filter((q) => q.showStatus === true)
        : [];
      const isShowAble = (status) => {
        const { CREATED, PUBLISHED, RESULT_PUBLISHED } = constants.exam.status;
        return [CREATED, PUBLISHED, RESULT_PUBLISHED].includes(status);
      };
      const exams = group.exams.filter((e) => isShowAble(e.status));
      group.lectures = lectures;
      group.chapters = chapters;
      group.questionSolves = questionSolves;
      group.exams = exams;
    }
    return group;
  },
  // findExam: async (groupId, examId) => groupMongoImpl.findExam(groupId, examId),
  updateCounterOfStudent: async (id, quantity) =>
    groupMongoImpl.updateCounterOfStudent(id, quantity),
  addLectureAccess: async (groupId, lectureId) =>
    groupMongoImpl.addLectureAccess(groupId, lectureId),
  addChapterAccess: async (groupId, chapterId) =>
    groupMongoImpl.addChapterAccess(groupId, chapterId),
  updateAccessStatusOfChapter: async (chapterId, groupId, status) =>
    groupMongoImpl.updateAccessStatusOfChapter(chapterId, groupId, status),
  updateAccessStatusOfLecture: async (lectureId, groupId, status) =>
    groupMongoImpl.updateAccessStatusOfLecture(lectureId, groupId, status),
  addExamAccess: async (groupId, exam) => {
    try {
      const addedExam = groupMongoImpl.addExamAccess(groupId, exam);
      return addedExam;
    } catch (err) {
      return Promise.reject(err);
    }
  },
  updateExamMoveToPrctice: async (groupId, examId) =>
    groupMongoImpl.updateExamMoveToPractice(groupId, examId),
  removeExamAccess: async (groupId, examId) =>
    groupMongoImpl.removeExamAccess(groupId, examId),
  removeExam: async (groupId, examId) =>
    groupMongoImpl.removeExam(groupId, examId),
  updateExam: async (examId, groupId, data) => {
    const examObj = { ...data, examId };
    return groupMongoImpl.updateExam(groupId, examId, examObj);
  },
  updateStatus: async (examId, groupId, status) =>
    groupMongoImpl.updateStatus(groupId, examId, status),
  addQuestionSolveAccess: async (groupId, qsid) =>
    groupMongoImpl.addQuestionSolveAccess(groupId, qsid),
  updateAccessStatusOfQuestionSolve: async (qsid, groupId, status) =>
    groupMongoImpl.updateAccessStatusOfQuestionSolve(qsid, groupId, status),
  countByCourseId: async (cid) => groupMongoImpl.countByCourseId(cid),
  analitycs: async (cids) => {
    const requests = [];
    cids.forEach((c) => {
      requests.push(groupMongoImpl.analitycs(c));
    });
    const ret = await Promise.all(requests);
    return ret;
  },
  countBySession: async (session) => groupMongoImpl.countBySession(session),
  groupExam: async (gid) => groupMongoImpl.groupExam(gid),
  getAllGroupByExamId: async (examId) =>
    groupMongoImpl.getAllGroupByExamId(examId),
};
