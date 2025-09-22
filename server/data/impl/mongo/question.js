/* eslint-disable no-underscore-dangle */
const constants = require("../../../constants");
const Question = require("../../../models/Question");
const Course = require("../../../models/Course");

module.exports = {
  create: async (data) => {
    try {
      const question = await Question.insertMany(data);
      return question;
    } catch (err) {
      console.log(err);
    }
  },
  getById: async (id) => {
    const question = await Question.findOne({ _id: id });
    return question;
  },
  search: async ({
    courseId,
    subjectId,
    lectureId,
    chapterId,
    title,
    lastId,
    all,
    questionSolveId,
  }) => {
    console.log("searching for questions", questionSolveId);
    const query = [
      {
        courseId,
        $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
      },
    ];
    if (chapterId) query.push({ chapterId });
    if (subjectId) query.push({ subjectId });
    if (lectureId) query.push({ lectureId });
    if (questionSolveId) query.push({ questionSolveId });
    if (title) query.push({ title: { $regex: title, $options: "i" } });
    let question;
    if (all) {
      question = await Question.find({ $and: query }).sort({ _id: -1 });
      return question;
    }
    if (!lastId) {
      question = await Question.find({ $and: query })
        .sort({ _id: -1 })
        .limit(100);
    }
    if (lastId) {
      question = await Question.find({
        $and: [{ _id: { $lt: lastId } }, ...query],
      })
        .sort({ _id: -1 })
        .limit(100);
    }
    return question;
  },
  updateById: async (id, data) => {
    const question = await Question.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          status: constants.question.status.PENDING,
          ...data,
        },
      },
      { new: true }
    );
    return question;
  },
  countBySession: async (session) => {
    const courses = await Course.find({ session }).select("_id").lean();
    const cids = courses.map((c) => c._id);
    const q = {
      $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
      courseId: { $in: cids },
    };
    const num = await Question.countDocuments(q);
    return num;
  },
  count: async (courseId) => {
    const q = {
      $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
      courseId,
    };
    const [MCQ, paragraph, short, checkbox, total] = await Promise.all([
      Question.countDocuments({ type: constants.question.type.MCQ, ...q }),
      Question.countDocuments({
        type: constants.question.type.PARAGRAPH,
        ...q,
      }),
      Question.countDocuments({
        type: constants.question.type.SHORT_ANS,
        ...q,
      }),
      Question.countDocuments({ type: constants.question.type.CHECKBOX, ...q }),
      Question.countDocuments({ ...q }),
    ]);
    const [pending, approved, rejected] = await Promise.all([
      Question.countDocuments({
        status: constants.question.status.PENDING,
        ...q,
      }),
      Question.countDocuments({
        status: constants.question.status.APPROVED,
        ...q,
      }),
      Question.countDocuments({
        status: constants.question.status.REJECTED,
        ...q,
      }),
    ]);
    const obj = {};
    obj[courseId] = {
      type: {
        MCQ,
        paragraph,
        short,
        checkbox,
      },
      status: {
        pending,
        approved,
        rejected,
      },
      total,
      courseId,
    };
    return obj;
  },
};
