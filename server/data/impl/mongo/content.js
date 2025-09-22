/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");
const constants = require("../../../constants");
const Chapter = require("../../../models/Chapter");
const Content = require("../../../models/Content");
const Lecture = require("../../../models/Lecture");
const QuestionSolve = require("../../../models/QuestionSolve");

module.exports = {
  create: async (data) => {
    const session = await mongoose.startSession();
    try {
      const { chapters, lectures, questionSolves } = data;
      session.startTransaction();
      const [content] = await Content.create([data], { session });
      console.log("content", content);
      let lecture;
      let chapter;
      if (content) {
        let update = {};
        if (content.type === constants.content.types.VIDEO) {
          update = { $push: { videoContents: content._id } };
        } else if (content.type === constants.content.types.FILE) {
          update = { $push: { fileContents: content._id } };
        }
        if (chapters && chapters[0]) {
          chapter = await Chapter.findOneAndUpdate(
            { _id: chapters[0] },
            { ...update },
            { new: true }
          ).session(session);
        }
        if (lectures && lectures[0]) {
          lecture = await Lecture.findOneAndUpdate(
            { _id: lectures[0] },
            { ...update },
            { new: true }
          ).session(session);
        }
        if (questionSolves && questionSolves[0]) {
          lecture = await QuestionSolve.findOneAndUpdate(
            { _id: questionSolves[0] },
            { ...update },
            { new: true }
          ).session(session);
        }
      }
      await session.commitTransaction();
      return { content, lecture, chapter };
    } catch (err) {
      await session.abortTransaction();
      return Promise.reject(err);
    } finally {
      session.endSession();
    }
  },
  getContents: async (ids) => {
    const contents = await Content.find({ id: { $in: ids } });
    return contents;
  },
  getContentById: async (id) => {
    const content = await Content.findById(id);
    return content;
  },
  searchContent: async (opt) => {
    const {
      title,
      subjectId,
      lectureId,
      courseId,
      chapterId,
      startDate,
      endDate,
    } = opt;
    const query = [];
    if (title) query.push({ title: { $regex: title, $options: "i" } });
    if (lectureId) {
      query.push({ lectures: { $in: [lectureId] } });
    }
    if (subjectId) {
      query.push({ subjects: { $in: [subjectId] } });
    }
    if (chapterId) {
      query.push({ chapters: { $in: [chapterId] } });
    }
    if (courseId) query.push({ courses: { $in: [courseId] } });
    if (startDate) query.push({ createdAt: { $gte: new Date(startDate) } });
    if (endDate) query.push({ createdAt: { $lte: new Date(endDate) } });

    const contents = await Content.find({ $and: query }).populate({
      path: "createdBy",
      select: "name username _id",
    });
    return contents;
  },
  deleteContent: async (id) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const content = await Content.findOneAndDelete({ _id: id }).session(
        session
      );

      if (content) {
        const promises = [];
        let query = null;
        let pullQuery = {};
        if (content.type === constants.content.types.FILE) {
          query = {
            fileContents: {
              $elemMatch: {
                $eq: content._id,
              },
            },
          };
          pullQuery = { $pull: { fileContents: content._id } };
        } else if (content.type === constants.content.types.VIDEO) {
          query = {
            videoContents: {
              $elemMatch: {
                $eq: content._id,
              },
            },
          };
          pullQuery = { $pull: { videoContents: content._id } };
        }
        let chapters = [];
        if (query) {
          chapters = await Chapter.find(query).session(session);
        }

        chapters.forEach((ch) => {
          const promise = Chapter.findOneAndUpdate(
            { _id: ch._id },
            pullQuery
          ).session(session);

          promises.push(promise);
        });

        let lectures = [];
        if (query) {
          lectures = await Lecture.find(query).session(session);
        }

        lectures.forEach((lec) => {
          const promise = Lecture.findOneAndUpdate(
            { _id: lec._id },
            pullQuery
          ).session(session);
          promises.push(promise);
        });
        await Promise.all(promises);
      }
      await session.commitTransaction();
      return content;
    } catch (err) {
      await session.abortTransaction();
      return Promise.reject(err);
    } finally {
      session.endSession();
    }
  },
  updateContentById: async (id, data) => {
    const content = await Content.findOneAndUpdate({ _id: id }, data, {
      new: true,
    });
    return content;
  },
  publishContentById: async (id, publish) => {
    const content = await Content.findOneAndUpdate(
      { _id: id },
      { isPublished: publish },
      { new: true }
    );
    return content;
  },
  addAccess: async (content, { chapterId, lectureId, questionSolveId }) => {
    let chapter = {};
    let lecture = {};
    let questionSolve = {};
    let update = {};
    if (content.type === constants.content.types.VIDEO) {
      update = { $addToSet: { videoContents: content._id } };
    } else if (content.type === constants.content.types.FILE) {
      update = { $addToSet: { fileContents: content._id } };
    }
    if (chapterId) {
      chapter = await Chapter.findOneAndUpdate(
        { _id: chapterId },
        { ...update },
        { new: true }
      );
    }
    if (lectureId) {
      lecture = await Lecture.findOneAndUpdate(
        { _id: lectureId },
        { ...update },
        { new: true }
      );
    }
    if (questionSolveId) {
      questionSolve = await QuestionSolve.findOneAndUpdate(
        { _id: questionSolveId },
        { ...update },
        { new: true }
      );
    }
    return { chapter, lecture, questionSolve };
  },
  updateStatus: async (key, url = "", duration, status, encVersion) => {
    // const content = await Content.findOneAndUpdate(
    //   { key },
    //   { isAvailable: status },
    //   { new: true },
    // );
    //update both status and key

    const content = await Content.findOneAndUpdate(
      { key },
      { isAvailable: status, URL: url, duration, isDrmEnabled: encVersion },
      { new: true }
    );

    return content;
  },
  findDurationByURL: async (url) => {
    const content = await Content.findOne({ key: url });
    return content;
  },
  findEncKeyByURL: async (url) => {
    const content = await Content.findOne({ URL: url });
    return content;
  },
};
