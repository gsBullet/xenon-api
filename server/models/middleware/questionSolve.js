/* eslint-disable no-underscore-dangle */
const groupRedisImpl = require('../../data/impl/redis/group');
const groupMongoImpl = require('../../data/impl/mongo/group');

const initHooks = (schema) => {
  schema.post('findOneAndUpdate', async (doc) => {
    if (doc) {
      const groups = await groupMongoImpl.getAllGroupsByQuestionSolveId(doc._id);
      if (groups) {
        const promises = [];
        groups.forEach((e) => {
          if (e) { promises.push(groupRedisImpl.delete(e)); }
        });
        await Promise.all(promises);
      }
    }
  });
};
module.exports = {
  initHooks,
};
