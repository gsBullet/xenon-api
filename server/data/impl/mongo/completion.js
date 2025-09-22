const Completion = require('../../../models/Completion');

module.exports = {
  create: async (data) => {
    const newCompletion = new Completion(data);
    const createdCompletion = await newCompletion.save();
    return createdCompletion;
  },
  getBySubjectIdAndStudentId: async (subjectId, studentId) => {
    const completion = await Completion.find({ subjectId, studentId });
    return completion;
  },
  getByCourseIdAndStudentId: async (courseId, studentId) => {
    const completion = await Completion.find({ courseId, studentId });
    return completion;
  },
  addVideo: async ({
    videoId, studentId, subjectId, courseId,
  }) => {
    const completion = await Completion.findOneAndUpdate(
      { studentId, subjectId, courseId },
      { $addToSet: { video: videoId } },
      { new: true },
    );
    return completion;
  },
  addFile: async ({
    fileId, studentId, subjectId, courseId,
  }) => {
    const completion = await Completion.findOneAndUpdate(
      { studentId, subjectId, courseId },
      { $addToSet: { file: fileId } },
      { new: true },
    );
    return completion;
  },
};
