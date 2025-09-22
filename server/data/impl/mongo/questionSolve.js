/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const QuestionSolve = require('../../../models/QuestionSolve');
const Subject = require('../../../models/Subject');
const Course = require('../../../models/Course');

module.exports = {
  create: async (data) => {
    const session = await mongoose.startSession();
    try {
      const { subjectId } = data;
      session.startTransaction();
      const [qs] = await QuestionSolve.create([data], { session });
      let subject;
      if (qs) {
        subject = await Subject.findByIdAndUpdate(
          subjectId,
          { $addToSet: { questionSolves: qs._id } },
          { new: true },
        ).session(session);
      }
      await session.commitTransaction();
      return { questionSolve: qs, subject };
    } catch (err) {
      await session.abortTransaction();
      return Promise.reject(err);
    } finally {
      session.endSession();
    }
  },
  getById: async (id) => {
    const qs = await QuestionSolve
      .findById(id)
      .populate('videoContents')
      .populate('fileContents')
      .lean();
    return qs;
  },
  getBySubjectId: async (subjectId) => {
    const qs = await Subject
      .findById(subjectId)
      .populate('questionSolves')
      .select('questionSolves, _id');
    return qs;
  },
  updateContents: async (id, { fileContents, videoContents }) => {
    let query = {};
    if (fileContents) {
      query = { $set: { fileContents } };
    } else if (videoContents) {
      query = { $set: { videoContents } };
    }
    const questionSolve = await QuestionSolve.findOneAndUpdate(
      { _id: id },
      { ...query },
      { new: true },
    );
    return questionSolve;
  },
  update: async (id, data) => {
    const session = await mongoose.startSession();
    try {
      const { subjectId } = data;
      session.startTransaction();
      const questionSolve = await QuestionSolve
        .findOneAndUpdate({ _id: id }, { $set: data })
        .session(session);
      let subject;
      // eslint-disable-next-line eqeqeq
      if (questionSolve && subjectId && subjectId != questionSolve.subjectId) {
        subject = await Subject.findByIdAndUpdate(
          questionSolve.subjectId,
          { $pull: { questionSolves: id } },
          { new: true },
        ).session(session);

        subject = await Subject.findByIdAndUpdate(
          subjectId,
          { $addToSet: { questionSolves: id } },
          { new: true },
        ).session(session);
      }

      await session.commitTransaction();
      return { questionSolve, subject };
    } catch (err) {
      await session.abortTransaction();
      return Promise.reject(err);
    } finally {
      session.endSession();
    }
  },
  delete: async (id) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const questionSolve = await QuestionSolve
        .findOneAndDelete({ _id: id })
        .session(session);

      let subject;
      if (questionSolve) {
        subject = await Subject.findByIdAndUpdate(
          questionSolve.subjectId,
          { $pull: { questionSolves: id } },
          { new: true },
        ).session(session);
      }
      await session.commitTransaction();

      return { questionSolve, subject };
    } catch (err) {
      await session.abortTransaction();
      return Promise.reject(err);
    } finally {
      session.endSession();
    }
  },
  removeContents: async (id, { fileContents, videoContents }) => {
    let query = {};
    if (fileContents) {
      query = { $pull: { fileContents: { $in: fileContents } } };
    } else if (videoContents) {
      query = { $pull: { videoContents: { $in: videoContents } } };
    }
    const questionSolve = await QuestionSolve.findByIdAndUpdate(id, query, { new: true });
    return questionSolve;
  },
  totalQuestionSolvesByCourseId: async (courseId) => {
    const subjects = await Subject.find({ courseId });
    const subjectIds = subjects.map((s) => s._id);
    const num = await QuestionSolve.countDocuments({ subjectId: { $in: subjectIds } });
    return num;
  },
  totalContentBySession: async (session) => {
    const courses = await Course
      .find({ session })
      .select('_id')
      .lean();
    const cids = courses.map((c) => c._id);
    const subjects = await Subject
      .find({ courseId: { $in: cids } })
      .select('_id')
      .lean();
    const subjectIds = subjects.map((s) => s._id);
    const questionSolves = await QuestionSolve
      .find({ subjectId: { $in: subjectIds } })
      .select(['videoContents', 'fileContents'])
      .lean();
    let videos = 0;
    let notes = 0;
    questionSolves.forEach((c) => {
      videos += c.videoContents ? c.videoContents.length : 0;
      notes += c.fileContents ? c.fileContents.length : 0;
    });
    return { notes, videos };
  },
  totalContentByCourseId: async (courseId) => {
    const subjects = await Subject.find({ courseId });
    const subjectIds = subjects.map((s) => s._id);
    const questionSolves = await QuestionSolve.find({ subjectId: { $in: subjectIds } });
    let videos = 0;
    let notes = 0;
    questionSolves.forEach((c) => {
      videos += c.videoContents ? c.videoContents.length : 0;
      notes += c.fileContents ? c.fileContents.length : 0;
    });
    return { notes, videos, questionSolvesCount: questionSolves.length };
  },
};
