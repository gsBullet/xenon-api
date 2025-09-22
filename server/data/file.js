const fileMongoImpl = require('./impl/mongo/file');

module.exports = {
  create: async (data) => fileMongoImpl.create(data),
  getFiles: async () => fileMongoImpl.getFiles(),
};
