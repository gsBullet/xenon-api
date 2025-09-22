const questionMongoImpl = require('./impl/mongo/question');
const questionRedisImpl = require('./impl/redis/question');

module.exports = {
  create: async (data) => questionMongoImpl.create(data),
  getById: async (id) => {
    let question = await questionRedisImpl.get(id);
    if (!question) question = await questionMongoImpl.getById(id);
    return question;
  },
  search: async (option) => questionMongoImpl.search(option),
  updateById: async (id, data) => questionMongoImpl.updateById(id, data),
  count: async (courses) => {
    const requests = [];
    courses.forEach((c) => {
      requests.push(questionMongoImpl.count(c));
    });
    const ret = await Promise.all(requests);
    return ret;
  },
  countBySession: async (session) => questionMongoImpl.countBySession(session),
};
