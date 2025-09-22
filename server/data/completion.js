const constants = require('../constants');
const completionMongoImpl = require('./impl/mongo/completion');

module.exports = {
  create: async (data) => completionMongoImpl.create(data),
  markAsComplete: async ({
    id, type, studentId, subjectId, courseId,
  }) => {
    if (type === constants.content.types.FILE) {
      const completion = completionMongoImpl.addFile({
        fileId: id, studentId, subjectId, courseId,
      });
      return completion;
    }
    const completion = completionMongoImpl.addVideo({
      videoId: id, studentId, subjectId, courseId,
    });
    return completion;
  },
  getByCourseIdAndStudentId: async (courseId, studentId) => completionMongoImpl
    .getByCourseIdAndStudentId(courseId, studentId),
};
