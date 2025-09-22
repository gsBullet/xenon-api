const mongoose = require("mongoose");

const { ObjectId } = require("mongoose").SchemaTypes;

const segmentedExamSubject = new mongoose.Schema({
  examId: {
    type: ObjectId,
    required: true,
    ref: "Exam", // Reference to 'Exam' collection
  },
  studentId: {
    type: ObjectId,
    required: true,
    ref: "Student", // Reference to 'Student' collection
  },
  isPracticeExam: {
    type: Boolean,
    default: false,
  },
  mandatorySubjects: [
    {
      type: ObjectId,
      ref: "Subject", // Reference to 'Subject' collection
      required: true,
    },
  ],
  compulsoryOptionalSubjects: [
    {
      type: ObjectId,
      ref: "Subject", // Reference to 'Subject' collection
      required: true,
    },
  ],
  optionalSubjects: [
    {
      type: ObjectId,
      ref: "Subject", // Reference to 'Subject' collection
      required: true,
    },
  ],
});

module.exports = mongoose.model("SegmentedExamSubject", segmentedExamSubject);
