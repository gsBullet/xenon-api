/* eslint-disable no-underscore-dangle */
const examResultRedisImpl = require('../../data/impl/redis/examResult');

const initHooks = (schema) => {
  schema.post('findOneAndUpdate', async (doc) => {
    if (doc) {
      const { studentId, examId, groupId } = doc;
      examResultRedisImpl.setExamResult(examId, studentId, groupId);
    }
  });
};
module.exports = {
  initHooks,
};
