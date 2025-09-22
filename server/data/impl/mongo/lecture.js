/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");
const Lecture = require("../../../models/Lecture");
const Subject = require("../../../models/Subject");
const Course = require("../../../models/Course");
const { is } = require("bluebird");

module.exports = {
  create: async (data) => {
    const session = await mongoose.startSession();
    try {
      const { subjectId } = data;
      session.startTransaction();
      const [lecture] = await Lecture.create([data], { session });
      let subject;
      if (lecture) {
        subject = await Subject.findByIdAndUpdate(
          subjectId,
          { $addToSet: { lectures: lecture._id } },
          { new: true }
        ).session(session);
      }
      await session.commitTransaction();

      return { lecture, subject };
    } catch (err) {
      await session.abortTransaction();
      return Promise.reject(err);
    } finally {
      session.endSession();
    }
  },
  getById: async (id, isStudent = false) => {
    const lecture = await Lecture.findById(id)
      .populate({
        path: "videoContents",
        options: { sort: { updatedAt: -1 } },
      })
      .populate({
        path: "fileContents",
        options: { sort: { updatedAt: -1 } },
      })
      .lean();
    if (isStudent) {
      const filteredVideoContents = lecture.videoContents.filter(
        (video) => video.isPublished !== false
      );
      lecture.videoContents = filteredVideoContents;
    }

    return lecture;
  },
  getLecturesBySubjectId: async (subjectId) => {
    const lectures = await Subject.findById(subjectId)
      .populate("lectures")
      .select("lectures, _id");
    return lectures;
  },
  updateContents: async (id, { fileContents, videoContents }) => {
    let query = {};
    if (fileContents) {
      query = { $set: { fileContents } };
    } else if (videoContents) {
      query = { $set: { videoContents } };
    }
    const lecture = await Lecture.findOneAndUpdate(
      { _id: id },
      { ...query },
      { new: true }
    );
    return lecture;
  },
  update: async (id, data) => {
    const session = await mongoose.startSession();
    try {
      const { subjectId } = data;
      session.startTransaction();
      const lecture = await Lecture.findOneAndUpdate(
        { _id: id },
        { $set: data }
      ).session(session);

      let subject;
      // eslint-disable-next-line eqeqeq
      if (lecture && subjectId && subjectId != lecture.subjectId) {
        subject = await Subject.findByIdAndUpdate(
          lecture.subjectId,
          { $pull: { lectures: id } },
          { new: true }
        ).session(session);

        subject = await Subject.findByIdAndUpdate(
          subjectId,
          { $addToSet: { lectures: id } },
          { new: true }
        ).session(session);
      }

      await session.commitTransaction();

      return { lecture, subject };
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
      const lecture = await Lecture.findOneAndDelete({ _id: id }).session(
        session
      );

      let subject;
      if (lecture) {
        subject = await Subject.findByIdAndUpdate(
          lecture.subjectId,
          { $pull: { lectures: id } },
          { new: true }
        ).session(session);
      }
      await session.commitTransaction();

      return { lecture, subject };
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
    const lecture = await Lecture.findByIdAndUpdate(id, query, { new: true });
    return lecture;
  },
  totalContentBySession: async (session) => {
    const courses = await Course.find({ session }).select("_id").lean();
    const cids = courses.map((c) => c._id);
    const subjects = await Subject.find({ courseId: { $in: cids } })
      .select("_id")
      .lean();
    const subjectIds = subjects.map((s) => s._id);
    const lectures = await Lecture.find({ subjectId: { $in: subjectIds } })
      .select(["videoContents", "fileContents"])
      .lean();
    let videos = 0;
    let notes = 0;
    lectures.forEach((l) => {
      videos += l.videoContents ? l.videoContents.length : 0;
      notes += l.fileContents ? l.fileContents.length : 0;
    });
    return { notes, videos };
  },
  totalContentByCourseId: async (courseId) => {
    const subjects = await Subject.find({ courseId });
    const subjectIds = subjects.map((s) => s._id);
    const lectures = await Lecture.find({ subjectId: { $in: subjectIds } });
    let videos = 0;
    let notes = 0;
    lectures.forEach((l) => {
      videos += l.videoContents ? l.videoContents.length : 0;
      notes += l.fileContents ? l.fileContents.length : 0;
    });
    return { notes, videos, lectureCount: lectures.length };
  },
};
