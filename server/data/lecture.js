const lectureMongoImpl = require('./impl/mongo/lecture');

module.exports = {
  create: async (data) => lectureMongoImpl.create(data),
  getById: async (id, isStudent) => lectureMongoImpl.getById(id, isStudent),
  getLecturesBySubjectId: async (subjectId) => lectureMongoImpl.getLecturesBySubjectId(subjectId),
  updateContents: async (id, data) => lectureMongoImpl.updateContents(id, data),
  update: async (id, data) => lectureMongoImpl.update(id, data),
  delete: async (id) => lectureMongoImpl.delete(id),
  removeContents: async (id, data) => lectureMongoImpl.removeContents(id, data),
  totalContentByCourseId: async (courseId) => lectureMongoImpl
    .totalContentByCourseId(courseId),
  totalContentBySession: async (session) => lectureMongoImpl
    .totalContentBySession(session),
};
