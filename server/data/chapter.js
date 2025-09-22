const chapterMongoImpl = require('./impl/mongo/chapter');

module.exports = {
  create: async (data) => chapterMongoImpl.create(data),
  getById: async (id) => chapterMongoImpl.getById(id),
  getChaptersBySubjectId: async (id) => chapterMongoImpl.getChaptersBySubjectId(id),
  updateContents: async (id, data) => chapterMongoImpl.updateContents(id, data),
  update: async (id, data) => chapterMongoImpl.update(id, data),
  delete: async (id) => chapterMongoImpl.delete(id),
  removeContents: async (id, data) => chapterMongoImpl.removeContents(id, data),
  totalContentByCourseId: async (courseId) => chapterMongoImpl.totalContentByCourseId(courseId),
  totalContentBySession: async (session) => chapterMongoImpl.totalContentBySession(session),
};
