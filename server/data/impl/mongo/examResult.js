/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Types;
const Student = require("../../../models/Student");
const Exam = require("../../../models/Exam");
const ExamResult = require("../../../models/ExamResult");
const constants = require("../../../constants");
const utils = require("../../../lib/utils");
const logger = require("../../../lib/winston");
const exam = require("./exam");
const { is } = require("bluebird");

const getPosition = async (marksObtained, examId) => {
  if (examId === null) {
    return "N/A";
  }
  const position = await ExamResult.find({
    $and: [{ examId }, { marksObtained: { $gt: marksObtained } }],
  })
    .sort({ marksObtained: 1 })
    .countDocuments();
  return position + 1;
};

const retryPublishUpdateHandle = async (
  examId,
  studentId,
  groupId,
  submittedAt = 0,
  examInGroup,
  { hsc, ssc }
) => {
  logger.error(
    `Publish update failed for student: ${studentId}, exam: ${examId}, group: ${groupId}. Retrying...`
  );
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const res = await Promise.all([
      ExamResult.findOne({ examId, studentId, groupId }).session(session),
      Student.findById(studentId).select([
        "_id",
        "name",
        "sid",
        "username",
        "contact",
        "HSCGPA",
        "SSCGPA",
        "firstTime",
      ]),
    ]);
    let resMark = 0;
    let [, student] = res;
    const [examResult] = res;
    let { hsc: HSC, ssc: SSC } = examInGroup;
    HSC = HSC || hsc || 0;
    SSC = SSC || ssc || 0;
    let gpaFactor;
    if (examInGroup.addGPA && student) {
      resMark = student.HSCGPA * HSC + student.SSCGPA * SSC;
      if (Number.isNaN(resMark)) resMark = 0;
      if (!student.firstTime) resMark -= 5;
      gpaFactor = { hsc: HSC, ssc: SSC };
    }
    if (examResult) {
      const withoutGPA = examResult.answers.reduce((sum, ans) => {
        if (ans && ans.marks) {
          return sum + ans.marks;
        }
        return 0;
      }, 0);
      const negativeMarks = examResult.answers.reduce((sum, ans) => {
        let marks = 0;
        if (ans && ans.marks) {
          marks = ans.marks;
        }
        return marks < 0 ? sum + marks : sum + 0;
      }, 0);
      const marksObtained = resMark + withoutGPA;

      const setter = {
        publishedAt: Date.now(),
        marksObtained,
        negativeMarks,
        withoutGPA,
        gpaFactor,
      };
      if (submittedAt) {
        setter.submittedAt = submittedAt;
      }
      const updatedExamResult = await ExamResult.findOneAndUpdate(
        { examId, studentId, groupId },
        { $set: setter },
        { new: true }
      ).session(session);
      if (submittedAt) {
        student = await Student.findOneAndUpdate(
          { $and: [{ _id: studentId }, { "exams.exam": examId }] },
          { $set: { "exams.$.submittedAt": submittedAt } },
          { new: true }
        )
          .select(["_id", "name", "sid", "username", "contact"])
          .session(session);
      }
      await session.commitTransaction();
      if (!updatedExamResult) return null;
      let ret = JSON.stringify(updatedExamResult);
      ret = JSON.parse(ret);
      ret.student = student || {};
      return ret;
    }
  } catch (err) {
    await session.abortTransaction();
    return Promise.reject(err);
  } finally {
    session.endSession();
  }
};

const retryPublishUpdate = async (
  examId,
  studentId,
  groupId,
  submittedAt = 0,
  examInGroup,
  { hsc, ssc }
) => {
  try {
    await retryPublishUpdateHandle(
      examId,
      studentId,
      groupId,
      submittedAt,
      examInGroup,
      { hsc, ssc }
    );
  } catch (err) {
    console.error(err);
    logger.error(err);
    retryPublishUpdateHandle(
      examId,
      studentId,
      groupId,
      submittedAt,
      examInGroup,
      { hsc, ssc }
    );
  }
};

module.exports = {
  create: async (studentId, examId, groupId) => {
    const now = Date.now();
    const setCode = await utils.cryptoRandomInteger(6);
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const examResult = await new ExamResult({
        setCode,
        studentId,
        examId,
        groupId,
        startsAt: now,
      }).save({ session });
      const student = await Student.findOneAndUpdate(
        { _id: studentId },
        { $addToSet: { exams: { setCode, exam: examId, startsAt: now } } },
        { new: true }
      )
        .select(["_id", "name", "sid"])
        .session(session);
      await session.commitTransaction();
      return { examResult, student };
    } catch (err) {
      await session.abortTransaction();
      return Promise.reject(err);
    } finally {
      session.endSession();
    }
  },
  retakeExam: async (studentId, examId) => {
    const session = await mongoose.startSession();
    try {
      const now = Date.now();
      session.startTransaction();
      const examResult = await ExamResult.findOneAndUpdate(
        { examId, studentId },
        {
          $set: {
            answers: [],
            startsAt: now,
            publishedAt: 0,
          },
        },
        { new: true }
      ).session(session);

      const student = await Student.findOneAndUpdate(
        { $and: [{ _id: studentId }, { "exams.exam": examId }] },
        {
          $set: {
            "exams.$": {
              exam: examId,
              startsAt: now,
              submittedAt: 0,
            },
          },
        },
        { new: true }
      ).select(["_id", "name", "sid"]);
      await session.commitTransaction();
      return { examResult, student };
    } catch (err) {
      await session.abortTransaction();
      return Promise.reject(err);
    } finally {
      session.endSession();
    }
  },
  getByExamId: async (examId, groupId, lastId, all) => {
    let query = { examId, groupId };
    if (lastId) {
      query = {
        examId,
        groupId,
        _id: { $gt: lastId },
      };
    }
    if (all) {
      const examResult = await ExamResult.find(query)
        .populate({
          path: "studentId",
          select: "_id name username contact sid firstTime",
        })
        .lean();
      return examResult;
    }
    const examResult = await ExamResult.find(query)
      .populate({
        path: "studentId",
        select: "_id name username contact sid firstTime",
      })
      .limit(100)
      .sort({ _id: 1 })
      .lean();
    console.log("examResult: ", examResult);
    return examResult;
  },
  getByStudentIdAndExamId: async (
    studentId,
    examId,
    groupId,
    plain = false
  ) => {
    const examResult = await ExamResult.findOne({ examId, studentId, groupId })
      .populate("answers.questionId")
      .lean();
    if (!plain && examResult) {
      const position = await getPosition(examResult.marksObtained, examId);
      examResult.rank = position;
    }
    return examResult;
  },
  markAnswer: async ({
    studentId,
    examId,
    questionId,
    marks,
    notes,
    extra,
  }) => {
    const examResult = await ExamResult.findOneAndUpdate(
      { examId, studentId, "answers.questionId": questionId },
      {
        $set: {
          "answers.$.marks": marks,
          "answers.$.notes": notes,
          "answers.$.extra": extra,
        },
        isAssessed: true,
      },
      { new: true }
    );
    return examResult;
  },
  setAnswers: async (answers, examId, studentId, groupId) => {
    try {
      const d = await ExamResult.findOneAndUpdate(
        { studentId, examId },
        { $set: { answers } },
        { new: true }
      );
      console.log("setAnswers: ", d);
      return Promise.resolve("done");
    } catch (err) {
      return Promise.reject(err);
    }
  },
  addAnswer: async (data, examInGroup, mainExam) => {
    try {
      const { studentId, examId, questionId, extra } = data;
      let { answer } = data;
      const questionData = mainExam.questions.find((q) => {
        if (q && q.question) return q.question._id === questionId;
        return null;
      });
      if (!questionData)
        return Promise.reject(new Error(constants.errors.NOT_FOUND));

      const { question, point } = questionData;
      let submittedAnswer = await ExamResult.findOne({
        examId,
        studentId,
        "answers.questionId": questionId,
      });

      let marks = 0;
      const isMCQ =
        question.type === constants.question.type.MCQ ||
        question.type === constants.question.type.CHECKBOX;
      if (isMCQ) {
        answer = Array.isArray(answer) ? answer : [answer];
        const isOK = utils.validateAnswer(question.answer, answer);
        if (isOK) {
          marks = point;
        } else marks = mainExam.negativeMarkPerQuestion * point * -1;
      }
      if (submittedAnswer) {
        if (!examInGroup.multipleTimesSubmission) {
          return Promise.reject(new Error(constants.errors.NOT_UPDATE_ABLE));
        }
        await ExamResult.findOneAndUpdate(
          { examId, studentId, "answers.questionId": questionId },
          {
            $set: {
              "answers.$": {
                answer,
                questionId,
                marks,
                extra,
                questionType: question.type,
              },
            },
          }
        );
      } else {
        submittedAnswer = await ExamResult.findOneAndUpdate(
          { studentId, examId },
          {
            $addToSet: {
              answers: {
                answer,
                questionId,
                marks,
                extra,
                questionType: question.type,
              },
            },
          }
        );
      }
      return Promise.resolve("done");
    } catch (err) {
      return Promise.reject(err);
    }
  },
  submit: async (examId, studentId, submittedAt) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const examResult = await ExamResult.findOneAndUpdate(
        { examId, studentId },
        { $set: { submittedAt } },
        { new: true }
      )
        .select("-marksObtained, -answers")
        .session(session);

      await Student.findOneAndUpdate(
        { $and: [{ _id: studentId }, { "exams.exam": examId }] },
        { $set: { "exams.$.submittedAt": submittedAt } },
        { new: true }
      )
        .select(["_id", "name", "sid"])
        .session(session);
      await session.commitTransaction();
      return examResult;
    } catch (err) {
      await session.abortTransaction();
      return Promise.reject(err);
    } finally {
      session.endSession();
    }
  },
  // on submit - self evaluation submittedAt will be set
  // eslint-disable-next-line no-unused-vars
  publishUpdate: async (
    examId,
    studentId,
    groupId,
    publishedAt = Date.now(),
    submittedAt = 0,
    examInGroup,
    { hsc, ssc }
  ) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const res = await Promise.all([
        ExamResult.findOne({ examId, studentId, groupId }).session(session),
        Student.findById(studentId).select([
          "_id",
          "name",
          "sid",
          "username",
          "contact",
          "HSCGPA",
          "SSCGPA",
          "firstTime",
        ]),
      ]);
      let resMark = 0;
      let [, student] = res;
      const [examResult] = res;
      let { hsc: HSC, ssc: SSC } = examInGroup;
      HSC = HSC || hsc || 0;
      SSC = SSC || ssc || 0;
      let gpaFactor;
      console.log("examInGroup: ", examInGroup, examResult, student);
      if (examInGroup.addGPA && student) {
        resMark = student.HSCGPA * HSC + student.SSCGPA * SSC;
        if (Number.isNaN(resMark)) resMark = 0;
        gpaFactor = { hsc: HSC, ssc: SSC };
      }
      if (!student.firstTime && examInGroup.isCutMarks)
        resMark -= examInGroup.cutMarks;
      if (examResult) {
        const withoutGPA = examResult.answers.reduce((sum, ans) => {
          if (ans && ans.marks) {
            return sum + ans.marks;
          }
          return sum + 0;
        }, 0);
        const negativeMarks = examResult.answers.reduce((sum, ans) => {
          if (ans && ans.negativeMarks) {
            return sum + ans.negativeMarks;
          }
          const marks = ans && ans.marks ? ans.marks : 0;
          return marks < 0 ? sum + marks : sum + 0;
        }, 0);
        const marksObtained = resMark + withoutGPA;

        const setter = {
          publishedAt: Date.now(),
          marksObtained,
          negativeMarks,
          withoutGPA,
          gpaFactor,
        };
        if (submittedAt) {
          setter.submittedAt = submittedAt;
        }
        const updatedExamResult = await ExamResult.findOneAndUpdate(
          { examId, studentId, groupId },
          { $set: setter },
          { new: true }
        ).session(session);
        if (submittedAt) {
          student = await Student.findOneAndUpdate(
            { $and: [{ _id: studentId }, { "exams.exam": examId }] },
            { $set: { "exams.$.submittedAt": submittedAt } },
            { new: true }
          )
            .select(["_id", "name", "sid", "username", "contact"])
            .session(session);
        }
        await session.commitTransaction();
        if (!updatedExamResult) return null;
        let ret = JSON.stringify(updatedExamResult);
        ret = JSON.parse(ret);
        ret.student = student || {};
        return ret;
      }
    } catch (err) {
      await session.abortTransaction();
      retryPublishUpdate(examId, studentId, groupId, submittedAt, examInGroup, {
        hsc,
        ssc,
      });
      retryPublishUpdate(examId, studentId, groupId, submittedAt, examInGroup, {
        hsc,
        ssc,
      });
      return null;
    } finally {
      session.endSession();
    }
  },
  aggregate: async (examIds, groupIds = []) => {
    const groupOIds = groupIds.map((gid) => ObjectId(gid));
    const examOids = examIds.map((eid) => ObjectId(eid));
    const result = await ExamResult.aggregate([
      { $match: { examId: { $in: examOids }, groupId: { $in: groupOIds } } },
      {
        $group: {
          _id: "$studentId",
          total: { $sum: "$marksObtained" },
          count: { $sum: 1 },
          marks: {
            $push: {
              marksObtained: "$marksObtained",
              examId: "$examId",
              groupId: "$groupId",
            },
          },
        },
      },
      { $sort: { total: -1 } },
      {
        $project: {
          student: "$_id",
          total: "$total",
          count: "$count",
          marks: "$marks",
        },
      },
    ]);

    console.log("result: ", result);
    const student = await Student.populate(result, {
      path: "student",
      select: "name username contact sid -_id",
    });
    const final = await Exam.populate(student, {
      path: "marks.examId",
      select: "title totalMarks",
    });

    return final;
  },
  getByStudentId: async (studentId, opt) => {
    const { lastId, limit } = opt;
    console.log("opt: ", limit);
    const lmt = Number(limit);
    let query = { studentId, publishedAt: { $gt: 0 } };
    if (lastId) {
      query = {
        studentId,
        _id: { $lt: lastId },
        publishedAt: { $gt: 0 },
      };
    }
    const examResult = await ExamResult.find(query)
      .sort({ _id: -1 })
      .select(["-answers"])
      .limit(lmt)
      .lean();
    const requests = [];
    examResult.forEach((er) => {
      const r = getPosition(er.marksObtained, er.examId);
      requests.push(r);
    });
    const ranks = await Promise.all(requests);
    const populatedResult = await Exam.populate(examResult, {
      path: "examId",
      select: ["-questions"],
    });
    const finalExamResult = populatedResult.map((er, idx) => ({
      ...er,
      rank: ranks[idx],
    }));
    return { examResult: finalExamResult };
  },
  studentAnalitycs: async (id) => {
    const studentId = ObjectId(id);
    const result = await ExamResult.aggregate([
      { $match: { studentId, publishedAt: { $gt: 0 } } },
      {
        $lookup: {
          from: "exams",
          localField: "examId",
          foreignField: "_id",
          as: "exam",
        },
      },
      {
        $group: {
          _id: "$exam.isPracticeExam",
          averageMarkObtained: { $avg: "$marksObtained" },
          maxMarkObtained: { $max: "$marksObtained" },
          minMarkObtained: { $min: "$marksObtained" },
          totalMarksObtained: { $sum: "$marksObtained" },
          exams: {
            $push: {
              total: "$exam.totalMarks",
              marksObtained: "$marksObtained",
              examId: "$exam._id",
              passMark: "$exam.passMark",
              gpa: "$gpaFactor",
            },
          },
          totalExamCount: { $sum: 1 },
        },
      },
    ]);
    let liveExam = {};
    result.forEach((r) => {
      if (r._id[0] === false) {
        liveExam = r;
        let passCount = 0;
        let total = 0;
        r.exams.forEach((e) => {
          const g = e.gpa ? (e.gpa.hsc || 0) * 5 + (e.gpa.ssc || 0) * 5 : 0;
          total += (e.total[0] || 0) + g;
          if (e.passMark[0]) {
            const passMark = (e.total[0] / 100) * e.passMark[0];
            if (passMark <= e.marksObtained) passCount += 1;
          }
        });
        liveExam.passCount = passCount;
        liveExam.totalMarks = total;
        liveExam.failCount = r.totalExamCount - passCount;
      }
    });
    delete liveExam._id;
    delete liveExam.exams;
    return { liveExam };
  },
};
