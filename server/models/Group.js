const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { ObjectId } = require("mongoose").SchemaTypes;
const constants = require("../constants");
const group = require("./middleware/group");

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  courseId: {
    type: ObjectId,
    ref: "Course",
  },
  exams: [
    {
      hsc: {
        type: Number,
        default: 0,
      },
      ssc: {
        type: Number,
        default: 0,
      },
      multipleTimesSubmission: {
        type: Boolean,
        required: true,
      },
      moveToPractice: {
        type: Boolean,
        default: false,
      },
      moveToPracticeAfter: {
        type: Date,
      },
      status: {
        type: String,
        default: constants.exam.status.CREATED,
      },
      addGPA: {
        type: Boolean,
        default: true,
      },
      startsAt: {
        type: Date,
        required: true,
      },
      duration: {
        type: Number,
      },
      endsAt: {
        type: Date,
      },
      examId: {
        type: ObjectId,
        ref: "Exam",
      },
      publishedAt: {
        type: Number,
      },
      isCutMarks: {
        type: Boolean,
        default: false, // Default value can be customized
      },
      cutMarks: {
        type: Number,
        default: 5, // Default value can be customized
      },
    },
  ],
  lectures: [
    {
      showStatus: {
        type: Boolean,
        default: true,
      },
      lectureId: {
        type: ObjectId,
        ref: "Lecture",
      },
    },
  ],
  questionSolves: [
    {
      showStatus: {
        type: Boolean,
        default: true,
      },
      questionSolveId: {
        type: ObjectId,
        ref: "QuestionSolve",
      },
    },
  ],
  chapters: [
    {
      showStatus: {
        type: Boolean,
        default: true,
      },
      chapterId: {
        type: ObjectId,
        ref: "Chapter",
      },
    },
  ],
  session: {
    type: String,
  },
  image: {
    type: String,
  },
  totalStudents: {
    type: Number,
    default: 0,
  },
});

GroupSchema.index({ name: 1, courseId: 1, session: 1 }, { unique: true });
GroupSchema.plugin(timestamps);
group.initHooks(GroupSchema);
module.exports = mongoose.model("Group", GroupSchema);
