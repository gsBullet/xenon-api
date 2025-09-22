const analitycsRedisImpl = require('./impl/redis/analitycs');

module.exports = {
  insert: (key, data) => analitycsRedisImpl.insert(key, data),
  getActiveUserCount: () => analitycsRedisImpl.getAcitiveUserCount(),
  delete: async () => analitycsRedisImpl.delete(),
  removeActiveUserCount: () => new Promise((resolve, reject) => {
    analitycsRedisImpl.removeActiveUserCount((done) => {
      resolve(done);
    });
  }),
  getAllRequestCounts: () => new Promise((resolve, reject) => {
    analitycsRedisImpl.getAllRequestCounts((data, err) => {
      if (err) reject(err);
      resolve(data);
    });
  }),
  incrementRequestCount: (key) => analitycsRedisImpl.incrementRequestCount(key),
};
