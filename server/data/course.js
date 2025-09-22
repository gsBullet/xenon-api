const courseMongoImpl = require("./impl/mongo/course");

module.exports = {
  getAll: async (session = "") => courseMongoImpl.getAll(session),
  create: async (data) => courseMongoImpl.create(data),
  update: async (id, data) => courseMongoImpl.update(id, data),
  getCourseById: async (id) => courseMongoImpl.getCourseById(id),
  coursesBySession: async (id) => courseMongoImpl.coursesBySession(id),
  totalCourseBySession: async (session) =>
    courseMongoImpl.totalCourseBySession(session),
  getCourseWithSubject: async () => courseMongoImpl.getCourseWithSubject(),
};
