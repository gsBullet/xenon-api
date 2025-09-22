/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const Course = require('../../../models/Course');
const Subject = require('../../../models/Subject');

module.exports = {
  create: async (data) => {
    const session = await mongoose.startSession();
    try {
      const { courseId } = data;
      session.startTransaction();
      const subject = await new Subject(data).save({ session });
      const course = await Course.findByIdAndUpdate(
        courseId,
        { $addToSet: { subjects: subject._id } },
        { new: true },
      ).session(session);
      await session.commitTransaction();
      return { subject, course };
    } catch (err) {
      await session.abortTransaction();
      return Promise.reject(err);
    } finally {
      session.endSession();
    }
  },
  subjectsByCourseId: async (courseId) => {
    const subjects = await Subject.find({ courseId });
    return subjects;
  },
  /**
   * @deprecated
   */
  addSubjectToCourse: async (subjectId, courseId) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const subject = await Subject.findByIdAndUpdate(
        subjectId,
        { courseId },
        { new: true },
      ).session(session);
      const course = await Course.findByIdAndUpdate(
        courseId,
        { $addToSet: { subjects: subjectId } },
        { new: true },
      ).session(session);
      await session.commitTransaction();
      return { subject, course };
    } catch (err) {
      await session.abortTransaction();
      return Promise.reject(err);
    } finally {
      session.endSession();
    }
  },
  reorderLectureChapter: async (subjectId, { lectures, chapters, questionSolves }) => {
    let updatedLectures = {};
    let updatedChapters = {};
    let updatedQuestionSolves = {};

    if (lectures) {
      updatedLectures = await Subject.findByIdAndUpdate(
        subjectId,
        { $set: { lectures } },
        { new: true },
      );
    }
    if (chapters) {
      updatedChapters = await Subject.findByIdAndUpdate(
        subjectId,
        { $set: { chapters } },
        { new: true },
      );
    }
    if (questionSolves) {
      updatedQuestionSolves = await Subject.findByIdAndUpdate(
        subjectId,
        { $set: { questionSolves } },
        { new: true },
      );
    }
    return {
      lectures: updatedLectures,
      chapters: updatedChapters,
      questionSolves: updatedQuestionSolves,
    };
  },
  getById: async (id) => {
    const subject = await Subject.findById(id);
    return subject;
  },
  updateSubjectById: async (id, data) => {
    const subject = await Subject.findOneAndUpdate({ _id: id }, data, { new: true });
    return subject;
  },
  deleteSubject: async (id) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const subject = await Subject.findOneAndDelete({ _id: id })
        .session(session);
      let course = {};
      if (subject) {
        course = await Course.findByIdAndUpdate(
          subject.courseId,
          { $pull: { subjects: subject._id } },
          { new: true },
        ).session(session);
      }
      await session.commitTransaction();
      return { subject, course };
    } catch (err) {
      await session.abortTransaction();
      return Promise.reject(err);
    } finally {
      session.endSession();
    }
  },
  countByCourseId: async (courseId) => {
    const num = await Subject.countDocuments({ courseId });
    return num;
  },
};
