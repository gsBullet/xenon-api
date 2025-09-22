const questionSolveImpl = require('./impl/mongo/questionSolve');

module.exports = {
  create: async (data) => questionSolveImpl.create(data),
  getById: async (id) => questionSolveImpl.getById(id),
  getBySubjectId: async (id) => questionSolveImpl.getBySubjectId(id),
  updateContents: async (id, opt) => questionSolveImpl.updateContents(id, opt),
  update: async (id, data) => questionSolveImpl.update(id, data),
  delete: async (id) => questionSolveImpl.delete(id),
  removeContents: async (id, opt) => questionSolveImpl.removeContents(id, opt),
  totalQuestionSolvesByCourseId: async (id) => questionSolveImpl.totalQuestionSolvesByCourseId(id),
  totalContentBySession: async (session) => questionSolveImpl.totalContentBySession(session),
  totalContentByCourseId: async (courseId) => questionSolveImpl.totalContentByCourseId(courseId),

};
