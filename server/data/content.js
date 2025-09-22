const contentMongoImpl = require("./impl/mongo/content");

module.exports = {
  create: async (data) => contentMongoImpl.create(data),
  getById: async (id) => contentMongoImpl.getContentById(id),
  getContents: async (ids) => contentMongoImpl.getContents(ids),
  searchContent: async (options) => contentMongoImpl.searchContent(options),
  deleteContent: async (id) => contentMongoImpl.deleteContent(id),
  updateContentById: async (id, data) =>
    contentMongoImpl.updateContentById(id, data),
  publishContentById: async (id, publish) =>
    contentMongoImpl.publishContentById(id, publish),
  addAccess: async (content, data) => contentMongoImpl.addAccess(content, data),
  updateStatus: async (key, url, duration, status, encVersion) =>
    contentMongoImpl.updateStatus(key, url, duration, status, encVersion),
  findDurationByURL: async (url) => contentMongoImpl.findDurationByURL(url),
  findEncKeyByURL: async (url) => contentMongoImpl.findEncKeyByURL(url),
};
