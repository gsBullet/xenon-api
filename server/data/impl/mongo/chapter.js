/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');
const Chapter = require('../../../models/Chapter');
const Subject = require('../../../models/Subject');
const Course = require('../../../models/Course');

module.exports = {
  create: async (data) => {
    const session = await mongoose.startSession();
    try {
      const { subjectId } = data;
      session.startTransaction();
      const [chapter] = await Chapter.create([data], { session });
      let subject;
      if (chapter) {
        subject = await Subject.findByIdAndUpdate(
          subjectId,
          { $addToSet: { chapters: chapter._id } },
          { new: true },
        ).session(session);
      }
      await session.commitTransaction();
      return { chapter, subject };
    } catch (err) {
      await session.abortTransaction();
      return Promise.reject(err);
    } finally {
      session.endSession();
    }
  },
  getById: async (id) => {
    const chapter = await Chapter
      .findById(id)
      .populate('videoContents')
      .populate('fileContents')
      .lean();
    return chapter;
  },
  getChaptersBySubjectId: async (subjectId) => {
    const chapters = await await Subject
      .findById(subjectId)
      .populate('chapters')
      .select('chapters, _id');
    return chapters;
  },
  updateContents: async (id, { fileContents, videoContents }) => {
    let query = {};
    if (fileContents) {
      query = { $set: { fileContents } };
    } else if (videoContents) {
      query = { $set: { videoContents } };
    }
    const chapter = await Chapter.findOneAndUpdate(
      { _id: id },
      { ...query },
      { new: true },
    );
    return chapter;
  },
  update: async (id, data) => {
    const session = await mongoose.startSession();
    try {
      const { subjectId } = data;
      session.startTransaction();
      const chapter = await Chapter
        .findOneAndUpdate({ _id: id }, data)
        .session(session);

      let subject;
      // eslint-disable-next-line eqeqeq
      if (chapter && subjectId && subjectId != chapter.subjectId) {
        subject = await Subject.findByIdAndUpdate(
          chapter.subjectId,
          { $pull: { chapters: id } },
          { new: true },
        ).session(session);

        subject = await Subject.findByIdAndUpdate(
          subjectId,
          { $addToSet: { chapters: id } },
          { new: true },
        ).session(session);
      }

      await session.commitTransaction();

      return { chapter, subject };
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
      const chapter = await Chapter
        .findOneAndDelete({ _id: id })
        .session(session);

      let subject;
      if (chapter) {
        subject = await Subject.findByIdAndUpdate(
          chapter.subjectId,
          { $pull: { chapters: id } },
          { new: true },
        ).session(session);
      }
      await session.commitTransaction();

      return { chapter, subject };
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
    const chapter = await Chapter.findByIdAndUpdate(id, query, { new: true });
    return chapter;
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
    const chapters = await Chapter
      .find({ subjectId: { $in: subjectIds } })
      .select(['videoContents', 'fileContents'])
      .lean();
    let videos = 0;
    let notes = 0;
    chapters.forEach((c) => {
      videos += c.videoContents ? c.videoContents.length : 0;
      notes += c.fileContents ? c.fileContents.length : 0;
    });
    return { notes, videos };
  },
  totalContentByCourseId: async (courseId) => {
    const subjects = await Subject.find({ courseId });
    const subjectIds = subjects.map((s) => s._id);
    const chapters = await Chapter.find({ subjectId: { $in: subjectIds } });
    let videos = 0;
    let notes = 0;
    chapters.forEach((c) => {
      videos += c.videoContents ? c.videoContents.length : 0;
      notes += c.fileContents ? c.fileContents.length : 0;
    });
    return { notes, videos, chapterCount: chapters.length };
  },
};
