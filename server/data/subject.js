const subjectMongoImpl = require('./impl/mongo/subject');

module.exports = {
  create: async (data) => subjectMongoImpl.create(data),
  subjectsByCourseId: async (id) => subjectMongoImpl.subjectsByCourseId(id),
  /**
   * @deprecated
   */
  addSubjectToCourse: async (subjectId, courseId) => subjectMongoImpl
    .addSubjectToCourse(subjectId, courseId),
  deleteSubject: async (id) => subjectMongoImpl.deleteSubject(id),
  updateSubjectById: async (id, data) => subjectMongoImpl.updateSubjectById(id, data),
  reorder: async (subjectId, data) => subjectMongoImpl
    .reorderLectureChapter(subjectId, data),
  getById: async (id) => subjectMongoImpl.getById(id),
  totalSubjectByCourseId: async (courseId) => subjectMongoImpl.totalSubjectByCourseId(courseId),
  countByCourseId: async (cid) => subjectMongoImpl.countByCourseId(cid),
};
