const examRedisImpl = require("./impl/redis/exam");
const examMongoImpl = require("./impl/mongo/exam");
const examResultData = require("./examResult");
const suffle = require("../lib/suffle");
const { add } = require("../lib/winston");

module.exports = {
  create: async (data) => examMongoImpl.create(data),
  getById: async (id, groupId = "", opt = {}) => {
    const { isStudent, studentId } = opt;
    const isSecure = !isStudent || false;
    let exam = await examRedisImpl.get(id);
    console.log("exam", exam, isSecure);
    if (!exam) {
      console.log("exam not found in redis");
      exam = await examMongoImpl.getById(id);
    }

    let examResult;
    if (isStudent) {
      examResult = await examResultData.getByStudentIdAndExamId(
        studentId,
        id,
        groupId
      );
    }
    const examJO = JSON.stringify(exam);
    exam = JSON.parse(examJO);
    if (!isSecure && exam) {
      const questions = [];
      exam.questions.forEach((q) => {
        const {
          title,
          status,
          options,
          URL,
          image,
          file,
          type,
          _id,
          answer,
          explanation,
          instruction,
          subjectId,
          optionType,
          explanationExt,
        } = q.question;
        const obj = {
          title,
          status,
          options,
          URL,
          image,
          file,
          type,
          point: q.point,
          _id,
          instruction,
          subjectId,
          explanationExt,
          optionType,
        };
        if (examResult && examResult.publishedAt) {
          obj.answer = answer;
          obj.explanation = explanation;
        }
        questions.push(obj);
      });
      //const { questions: qs } = suffle.make(examResult.setCode, questions);

      const qs = suffle.make(examResult.setCode, questions, exam.shuffle);

      // segmentedExamSubject {
      //   mandatorySubjects: [ 63b7f2397c9d090b54d70908 ],
      //   compulsoryOptionalSubjects: [ 63b7f2757c9d090b54d70927, 63b7f291e911c50b5db60025 ],
      //   optionalSubjects: [],
      //   _id: 67695418a17cb7917eeac628,
      //   examId: 6769459702d29bce80c43827,
      //   studentId: 640eca76fe83c90b544e6c8b,
      //   __v: 0
      // }

      if (exam.isSegmentedExam) {
        const segmentedExamSubject =
          await examMongoImpl.getSegmentedExamSubject(
            id,
            studentId,
            exam.isPracticeExam
          );
        if (!segmentedExamSubject) {
          throw new Error("Segmented Exam Subject not found!");
        }
        const {
          mandatorySubjects,
          compulsoryOptionalSubjects,
          optionalSubjects,
        } = segmentedExamSubject;
        const subjects = mandatorySubjects
          .concat(compulsoryOptionalSubjects)
          .concat(optionalSubjects);
        qs.questions = qs.questions.filter((q) =>
          subjects.includes(q.subjectId)
        );
      }
      exam.questions = qs.questions;
      exam.studentStartsAt = examResult.startsAt;
    }
    return exam;
  },
  addSegmentedExamSubject: async (data) => {
    console.log("data", data);
    let exam = await examRedisImpl.get(data.examId);
    if (!exam) {
      console.log("addSegmentedExamSubject exam not found in redis");
      exam = await examMongoImpl.getById(data.examId);
    }
    if (!exam) {
      throw new Error("Exam not found");
    }

    return examMongoImpl.addSegmentedExamSubject({
      ...data,
      isPracticeExam: exam.isPracticeExam,
    });
  },
  getSegmentedExamSubject: async (examId, studentId) => {
    console.log("examId", examId, studentId);
    let exam = await examRedisImpl.get(examId);
    if (!exam) {
      console.log("addSegmentedExamSubject exam not found in redis");
      exam = await examMongoImpl.getById(examId);
    }
    if (!exam) {
      throw new Error("Exam not found");
    }

    return examMongoImpl.getSegmentedExamSubject(
      examId,
      studentId,
      exam.isPracticeExam
    );
  },
  delete: async (id) => examMongoImpl.delete(id),
  update: async (id, data) => examMongoImpl.update(id, data),
  removeQuestion: async (id, questionId) =>
    examMongoImpl.removeQuestion(id, questionId),
  changeExamType: async (id, isPracticeExam) =>
    examMongoImpl.changeExamType(id, isPracticeExam),
  addQuestion: async (id, newQuestion) =>
    examMongoImpl.addQuestion(id, newQuestion),
  getAllExamsByQuestinId: async (id) =>
    examMongoImpl.getAllExamsByQuestinId(id),
  getAllExamsByCourseId: async (id, lastId, opts) =>
    examMongoImpl.getAllExamsByCourseId(id, lastId, opts),
  analitycs: async (courseIds) => examMongoImpl.analitycs(courseIds),
};
