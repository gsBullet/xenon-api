const constants = require("../constants");
const examResultMongoImpl = require("./impl/mongo/examResult");
const examResultRedisImpl = require("./impl/redis/examResult");
// TODO: Need add groupId in exam participants set
const logger = require("../lib/winston");
const { update } = require("./course");
const { updateExamMoveToPractice } = require("./impl/mongo/group");

module.exports = {
  startExam: async (studentId, examId, groupId) => {
    try {
      const ret = await examResultMongoImpl.create(studentId, examId, groupId);
      await examResultRedisImpl.addToStartExamSet(examId, studentId, groupId);
      return ret;
    } catch (err) {
      return Promise.reject(err);
    }
  },
  getByStudentIdAndExamId: async (
    studentId,
    examId,
    groupId,
    plain = false
  ) => {
    let ret = null;
    if (plain) {
      ret = await examResultRedisImpl.getExamResult(studentId, examId, groupId);
    }
    if (!ret) {
      ret = await examResultMongoImpl.getByStudentIdAndExamId(
        studentId,
        examId,
        groupId,
        plain
      );
      await examResultRedisImpl.setExamResult(examId, studentId, groupId, ret);
    }
    return ret;
  },
  updateExamMoveToPractice: async (examId, scheduledTime) => {
    const ret = await examResultRedisImpl.addExamToMoveToPractice(
      examId,
      scheduledTime
    );
    return ret;
  },
  getExamsToMoveToPractice: async () => {
    const exams = await examResultRedisImpl.getExamsToMoveToPractice();
    return exams;
  },
  removeExamFromUpdateList: async (examId) => {
    try {
      const ret = await examResultRedisImpl.removeExamFromUpdateList(examId);
      console.log(`Exam ${examId} removed from update list.`);
      return ret;
    } catch (err) {
      console.log("Error in removing exam from update list", err);
      return Promise.reject(err);
    }
  },

  getByExamId: async (examId, groupId, lastId, all = false) =>
    examResultMongoImpl.getByExamId(examId, groupId, lastId, all),
  addAnswer: async (data, examInGroup, mainExam) =>
    examResultMongoImpl.addAnswer(data, examInGroup, mainExam),
  publishUpdate: async (
    examId,
    studentId,
    groupId,
    publishedAt,
    submittedAt = 0,
    exam
  ) => {
    const ret = examResultMongoImpl.publishUpdate(
      examId,
      studentId,
      groupId,
      publishedAt,
      submittedAt,
      exam,
      { ssc: 0, hsc: 0 }
    );
    return ret;
  },
  submit: async (examId, studentId, submittedAt) =>
    examResultMongoImpl.submit(examId, studentId, submittedAt),
  markAnswer: async (data) => examResultMongoImpl.markAnswer(data),
  retakeExam: async (studentId, examId) =>
    examResultMongoImpl.retakeExam(studentId, examId),
  aggregate: async (examIds, groupIds) =>
    examResultMongoImpl.aggregate(examIds, groupIds),
  publishAll_dep: async (examId, studentIds, groupId, exam, gpa = {}) => {
    const promises = [];
    studentIds.forEach((sid) => {
      const promise = examResultMongoImpl.publishUpdate(
        examId,
        sid,
        groupId,
        Date.now(),
        0,
        exam,
        gpa
      );
      promises.push(promise);
    });
    const result = await Promise.all(promises);
    return result;
  },
  publishAll: async (examId, studentIds, groupId, exam, gpa = {}) => {
    const results = [];
    const concurrentRequestCount = 100;
    const studentIdsSet = new Set(studentIds);
    console.log("studentIdsSet", studentIdsSet);
    // eslint-disable-next-line no-param-reassign
    studentIds = [...studentIdsSet];
    for (let i = 0; i < studentIds.length; i += concurrentRequestCount) {
      const requests = studentIds
        .slice(i, i + concurrentRequestCount)
        .map((sid) =>
          examResultMongoImpl.publishUpdate(
            examId,
            sid,
            groupId,
            Date.now(),
            0,
            exam,
            gpa
          )
        );
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(requests)
        .then((res) => {
          console.log("Results", res);
          results.push(...res);
        })
        .catch((e) =>
          logger.error(
            `Error in publish result for the batch ${i} - ${e}, exam: ${examId}, groupId: ${groupId}`
          )
        );
    }
    return results;
  },
  getByStudentId: async (studentId, opt) =>
    examResultMongoImpl.getByStudentId(studentId, opt),
  studentAnalitycs: async (studentId) =>
    examResultMongoImpl.studentAnalitycs(studentId),
  isStudentAnswered: async (examId, studentId, questionId, groupId, index) =>
    examResultRedisImpl.isStudentAnswered(
      examId,
      studentId,
      questionId,
      groupId,
      index
    ),
  insertAnswer: (data, examId, studentId, groupId) =>
    examResultRedisImpl.insert(data, examId, studentId, groupId),
  setAnswers: (data, examId, studentId, groupId) =>
    examResultMongoImpl.setAnswers(data, examId, studentId, groupId),
  removeFromSet: (examId, studentId, groupId) =>
    examResultRedisImpl.removeFromSet(examId, studentId, groupId),
  getExamParticipant: (examId, groupId) =>
    examResultRedisImpl.getExamParticipant(examId, groupId),
  getAnswers: async (examId, studentId, groupId) =>
    examResultRedisImpl.answers(examId, groupId, studentId),
  deleteAnswers: async (examId, studentId, groupId) =>
    examResultRedisImpl.deleteAnswers(examId, groupId, studentId),
  getStartedExams: async () =>
    new Promise((resolve, reject) => {
      examResultRedisImpl.getStartedExams((data, err) => {
        if (err) reject(err);
        resolve(data);
      });
    }),
  scheduleExam: async (examId, groupId, endsAt) =>
    Promise.all([
      examResultRedisImpl.scheduleExam(examId, groupId, endsAt),
      examResultRedisImpl.setExamResultProcess(
        examId,
        groupId,
        constants.resultStatusInRedis.NOT_PROCESSED_YET
      ),
    ]),
  deleteStartedExam: async (examId, groupId) =>
    examResultRedisImpl.deleteStartedExam(examId, groupId),
  // is specefic exam started in a group
  isExamStarted: async (examId, groupId) =>
    examResultRedisImpl.isExamStarted(examId, groupId),
  // true -> processing, false -> notProcessing
  setExamResultProcess: async (examId, groupId, flag) =>
    examResultRedisImpl.setExamResultProcess(examId, groupId, flag),
  getExamResultProcess: async (examId, groupId) =>
    examResultRedisImpl.getExamResultProcess(examId, groupId),
  isExamProcessing: async (examId, groupId) => {
    const [isStrated, status] = await Promise.all([
      examResultRedisImpl.isExamStarted(examId, groupId),
      examResultRedisImpl.getExamResultProcess(examId, groupId),
    ]);
    return isStrated && status === constants.resultStatusInRedis.PROCESSING;
  },
  examProcessedStatus: async (examId, groupId) => {
    const [isStrated, status] = await Promise.all([
      examResultRedisImpl.isExamStarted(examId, groupId),
      examResultRedisImpl.getExamResultProcess(examId, groupId),
    ]);
    if (!isStrated && status === constants.resultStatusInRedis.PROCESSED) {
      return constants.resultStatusInRedis.PROCESSED;
    }
    if (isStrated && status === constants.resultStatusInRedis.PROCESSING) {
      return constants.resultStatusInRedis.PROCESSING;
    }
    if (!isStrated && !status) {
      return constants.resultStatusInRedis.PROCESSED;
    }
    return constants.resultStatusInRedis.NOT_PROCESSED_YET;
  },
  getFinishedExams: async () => examResultRedisImpl.getFinishedExams(),
  retakeExamRedis: async (examId, studentId, groupId) =>
    examResultRedisImpl.addToStartExamSet(examId, studentId, groupId),
};
