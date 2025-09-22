/* eslint-disable no-underscore-dangle */
const questionRedisImpl = require('../../data/impl/redis/question');
const examRedisImpl = require('../../data/impl/redis/exam');
const examMongoImpl = require('../../data/impl/mongo/exam');

const initHooks = (schema) => {
  schema.post('save', (doc) => {
    questionRedisImpl.insert(doc);
  });
  schema.post('insertMany', (doc) => {
    doc.forEach((d) => {
      questionRedisImpl.insert(d);
    });
  });
  schema.post('find', (doc) => {
    doc.forEach((d) => {
      questionRedisImpl.insert(d);
    });
  });
  schema.post('findOne', (doc) => {
    questionRedisImpl.insert(doc);
  });
  schema.post('findOneAndUpdate', async (doc) => {
    questionRedisImpl.insert(doc);
    if (doc) {
      const exams = await examMongoImpl.getAllExamsByQuestinId(doc._id);
      if (exams) {
        const promises = [];
        exams.forEach((e) => {
          if (e) { promises.push(examRedisImpl.delete(e)); }
        });
        await Promise.all(promises);
      }
    }
  });
};
module.exports = {
  initHooks,
};
