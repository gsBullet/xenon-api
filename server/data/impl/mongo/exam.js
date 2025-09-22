const mongoose = require("mongoose");
const Exam = require("../../../models/Exam");
const SegmentedExamSubject = require("../../../models/SegmentedExamSubject");
const { add } = require("../../../lib/winston");

module.exports = {
  create: async (data) => {
    const exam = await new Exam(data).save();
    return exam;
  },

  addSegmentedExamSubject: async (data) => {
    console.log("data", data);
    if (data.isPracticeExam) {
      const segmentedExamSubject = await SegmentedExamSubject.findOneAndUpdate(
        {
          examId: data.examId,
          studentId: data.studentId,
          isPracticeExam: true,
        },
        { $set: data },
        { new: true, upsert: true }
      );
      console.log("addSegmentedExamSubject", segmentedExamSubject);
      return segmentedExamSubject;
    }

    console.log("addSegmentedExamSubject exam not found in redis");

    // if not practice exam then can not update

    const exist = await SegmentedExamSubject.findOne({
      examId: data.examId,
      studentId: data.studentId,
    });
    if (exist) {
      return Promise.reject({
        message: "Segmented exam subject already exist",
      });
    }

    const segmentedExamSubject = await new SegmentedExamSubject(data).save();
    return segmentedExamSubject;
  },
  getSegmentedExamSubject: async (examId, studentId, isPracticeExam) => {
    const segmentedExamSubject = await SegmentedExamSubject.findOne({
      examId,
      studentId,
      isPracticeExam,
    });
    return segmentedExamSubject;
  },
  getById: async (id) => {
    const exam = await Exam.findOne({
      _id: id,
      $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
    })
      .populate("questions.question")
      .lean();
    return exam;
  },
  getAllExamsByQuestinId: async (id) => {
    const exams = await Exam.find({ "questions.question": id });
    return exams;
  },
  getAllExamsByCourseId: async (
    id,
    lastId,
    { startDate, endDate, subjectId }
  ) => {
    let query = {
      courseId: id,
      $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
    };
    if (lastId) {
      query = {
        courseId: id,
        _id: { $lt: lastId },
        $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
      };
    }
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (subjectId) query.subjectId = subjectId;
    const exams = await Exam.find(query).sort({ _id: -1 }).limit(1000).lean();
    return exams;
  },
  addQuestion: async (id, newQuestions = []) => {
    const points = newQuestions.reduce((sum, q) => sum + q.point, 0);
    const exam = await Exam.findOneAndUpdate(
      {
        _id: id,
        $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
      },
      {
        $addToSet: { questions: newQuestions },
        $inc: { totalMarks: points },
      },
      { new: true }
    );
    return exam;
  },
  removeQuestion: async (id, questionId) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const exam = await Exam.findOneAndUpdate(
        {
          _id: id,
          $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
        },
        { $pull: { questions: { question: questionId } } },
        { new: true }
      ).session(session);
      let examFinal;
      if (exam) {
        const totalMarks = exam.questions.reduce((sum, q) => sum + q.point, 0);
        examFinal = await Exam.findOneAndUpdate(
          { _id: id },
          { $set: { totalMarks } },
          { new: true }
        ).session(session);
      }
      await session.commitTransaction();
      return examFinal;
    } catch (err) {
      await session.abortTransaction();
      return Promise.reject(err);
    } finally {
      session.endSession();
    }
  },
  changeExamType: async (id, isPracticeExam) => {
    const exam = await Exam.findOneAndUpdate(
      {
        _id: id,
        $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
      },
      { $set: { isPracticeExam } },
      { new: true }
    );
    return exam;
  },
  update: async (id, data) => {
    const exam = await Exam.findOneAndUpdate(
      {
        _id: id,
        $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
      },
      { $set: data },
      { new: true }
    );
    return exam;
  },
  delete: async (id) => {
    const exam = await Exam.findOneAndUpdate(
      {
        _id: id,
        $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
      },
      { $set: { isDeleted: true } },
      { new: true }
    );
    return exam;
  },
  analitycs: async (courses) => {
    const [totalLive, totalPractice, live, practice] = await Promise.all([
      Exam.countDocuments({
        isPracticeExam: false,
        courseId: { $in: courses },
        $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
      }),
      Exam.countDocuments({
        isPracticeExam: true,
        courseId: { $in: courses },
        $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
      }),
      Exam.aggregate([
        {
          $match: {
            isPracticeExam: false,
            courseId: { $in: courses },
            $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
          },
        },
        {
          $group: {
            _id: "$courseId",
            count: { $sum: 1 },
          },
        },
      ]),
      Exam.aggregate([
        {
          $match: {
            isPracticeExam: true,
            courseId: { $in: courses },
            $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
          },
        },
        {
          $group: {
            _id: "$courseId",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);
    return { totalLive, totalPractice, courseWise: { live, practice } };
  },
};
