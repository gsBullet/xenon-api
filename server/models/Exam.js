const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { ObjectId } = require("mongoose").SchemaTypes;
const constants = require("../constants");
const exam = require("./middleware/exam");

const ExamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  courseId: {
    type: ObjectId,
    ref: "Course",
  },
  instruction: {
    type: String,
  },
  subjectId: {
    type: ObjectId,
    ref: "Subject",
  },
  isPracticeExam: {
    type: Boolean,
    default: false,
  },
  passMark: {
    type: Number,
    required: true,
  },
  totalMarks: {
    type: Number,
    required: true,
  },
  isSegmentedExam: {
    type: Boolean,
    default: false,
  },
  segmentedExamDetails: {
    type: {
      totalSubjects: {
        type: Number,
        required: true,
      },
      totalQuestions: {
        type: Number,
        required: true,
      },
      minimumCompulsoryOptionalSubjects: {
        type: Number,
        default: 0,
      },
      mandatorySubjects: [
        {
          subjectId: {
            type: ObjectId,
            ref: "Subject",
            required: true,
          },
          count: {
            type: Number,
            required: true,
          },
        },
      ],
      compulsoryOptionalSubjects: [
        {
          subjectId: {
            type: ObjectId,
            ref: "Subject",
            required: true,
          },
          count: {
            type: Number,
            required: true,
          },
        },
      ],
      optionalSubjects: [
        {
          subjectId: {
            type: ObjectId,
            ref: "Subject",
            required: true,
          },
          count: {
            type: Number,
            required: true,
          },
        },
      ],
    },
    validate: {
      validator(v) {
        // If isSegmentedExam is true, segmentedExamDetails must exist
        if (this.isSegmentedExam && (!v || Object.keys(v).length === 0)) {
          return false;
        }
        return true;
      },
      message: "segmentedExamDetails is required when isSegmentedExam is true.",
    },
  },
  negativeMarkPerQuestion: {
    type: Number,
    required: true,
  },
  globalPoint: Number,
  questions: [
    {
      question: {
        type: ObjectId,
        ref: "Question",
      },
      point: Number,
    },
  ],
  status: {
    type: String,
    default: constants.exam.status.CREATED,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  shuffle: {
    type: Boolean,
    default: true,
  },
});
ExamSchema.plugin(timestamps);
ExamSchema.index({ title: 1 });
exam.initHooks(ExamSchema);

module.exports = mongoose.model("Exam", ExamSchema);
