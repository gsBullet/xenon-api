const { getById } = require("./group");
const studentMongoImpl = require("./impl/mongo/student");

module.exports = {
  addStudent: async (data) => studentMongoImpl.create(data),
  getByUsername: async (username, level) =>
    studentMongoImpl.getByUsername(username, level),
  getByStudentId: async (sid) => studentMongoImpl.getByStudentId(sid),
  getById: async (id) => studentMongoImpl.getById(id),
  addAlternateExamCode: async (username, code, link) =>
    studentMongoImpl.addAlternateExamCode(username, code, link),
  getAlternateExam: async (username) =>
    studentMongoImpl.getAlternateExam(username),
  addCourseForStudent: async (id, course) =>
    studentMongoImpl.addCourseForStudent(id, course),
  addGroupForStudent: async (id, group, courseId) =>
    studentMongoImpl.addGroupForStudent(id, group, courseId),
  removeCourseForStudent: async (id, course) =>
    studentMongoImpl.removeCourseForStudent(id, course),
  removeGroupForStudent: async (usernames, group) =>
    studentMongoImpl.removeGroupForStudent(usernames, group),
  getStudents: async (opts) => studentMongoImpl.getStudents(opts),
  updateById: async (id, data) => studentMongoImpl.updateById(id, data),
  updateByUsername: async (username, data) =>
    studentMongoImpl.updateByUsername(username, data),
  studentsByGroupId: (id) => studentMongoImpl.studentsByGroupId(id),
  getProfile: async (id) => studentMongoImpl.getProfile(id),
  getCourseByStudentWithSubjectAndChapter: async (id) =>
    studentMongoImpl.getCourseByStudentWithSubjectAndChapter(id),
  getCourseByStudent: async (id) => studentMongoImpl.getCourseByStudent(id),
  getProfileFromDB: async (id) => studentMongoImpl.getProfileFromDB(id),
  notificationSeenUpdate: async (id, notificationId) =>
    studentMongoImpl.notificationSeenUpdate(id, notificationId),
  deleteStudents: async (students) => studentMongoImpl.deleteStudents(students),
  getByUsernames: async (usernames) =>
    studentMongoImpl.getByUsernames(usernames),
  studentsCount: async (session) => studentMongoImpl.studentsCount(session),
  updateStatus: async (students, status) =>
    studentMongoImpl.updateStatus(students, status),
  studentsInCourse: async (courseId) =>
    studentMongoImpl.studentsInCourse(courseId),
};
