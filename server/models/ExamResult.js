const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const answer = require("./qa/answer");
const { ObjectId, Mixed } = require("mongoose").SchemaTypes;

const ExamResultSchema = new mongoose.Schema(
  {
    studentId: {
      type: ObjectId,
      ref: "Student",
    },
    groupId: {
      type: ObjectId,
      ref: "Group",
    },
    setCode: {
      type: Number,
      required: true,
    },
    examId: {
      type: ObjectId,
      ref: "Exam",
    },
    marksObtained: {
      type: Number,
      default: 0,
    },
    negativeMarks: {
      type: Number,
      default: 0,
    },
    answers: [
      {
        answer: Mixed, // array of strings
        questionId: {
          type: ObjectId,
          ref: "Question",
        },
        negativeMarks: Number,
        correct: Number,
        answered: Number,
        questionType: String,
        notes: String,
        marks: Number,
        extra: Mixed,
      },
    ],
    publishedAt: {
      type: Number,
      default: 0,
    },
    startsAt: {
      type: Number,
    },
    submittedAt: {
      type: Number,
      default: 0,
    },
    gpaFactor: {
      hsc: Number,
      ssc: Number,
    },
    withoutGPA: {
      type: Number,
      default: 0,
    },
    isAssessed: {
      type: Boolean,
      default: false,
    },
  },
  { autoCreate: true }
);
ExamResultSchema.plugin(timestamps);
ExamResultSchema.index({ studentId: 1, examId: 1 }, { unique: true });

module.exports = mongoose.model("ExamResult", ExamResultSchema);
