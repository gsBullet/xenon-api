/* eslint-disable no-underscore-dangle */
const groupRedisImpl = require('../../data/impl/redis/group');

const initHooks = (schema) => {
  schema.post('findOne', (doc) => {
    groupRedisImpl.insert(doc);
  });
  schema.post('findOneAndUpdate', async (doc) => {
    if (doc) { await groupRedisImpl.delete(doc); }
  });
};
module.exports = {
  initHooks,
};
