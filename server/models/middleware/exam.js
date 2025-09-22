const examRedisImpl = require('../../data/impl/redis/exam');

const initHooks = (schema) => {
  schema.post('findOne', (doc) => {
    examRedisImpl.insert(doc);
  });
  schema.post('findOneAndUpdate', async (doc) => {
    if (doc) { await examRedisImpl.delete(doc); }
  });
  schema.post('findOneAndDelete', async (doc) => {
    if (doc) { await examRedisImpl.delete(doc); }
  });
};
module.exports = {
  initHooks,
};
