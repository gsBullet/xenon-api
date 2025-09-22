const sessionRedisImpl = require('./impl/redis/session');
const sessionMongoImpl = require('./impl/mongo/session');

module.exports = {
  create: async (data) => sessionMongoImpl.create(data),
  getByUsername: async (username) => sessionMongoImpl.getByUsername(username),
  deleteByUsername: async (username, sessionId) => {
    try {
      await sessionRedisImpl.deleteByKey(sessionId);
      const session = await sessionMongoImpl.deleteByUsername(username);
      return session;
    } catch (err) {
      return Promise.reject(err);
    }
  },
};
