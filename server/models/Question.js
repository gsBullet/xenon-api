const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { ObjectId, Mixed } = require("mongoose").SchemaTypes;
const constants = require("../constants");
const question = require("./middleware/question");

const QuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: constants.question.status.PENDING,
  },
  options: [String],
  answer: [String],
  explanation: String,
  explanationExt: Mixed,
  explanationTables: Mixed,
  rejectMessage: String,
  lectureId: {
    type: ObjectId,
    ref: "Lecture",
  },
  chapterId: {
    type: ObjectId,
    ref: "Chapter",
  },
  subjectId: {
    type: ObjectId,
    ref: "Subject",
  },
  questionSolveId: {
    type: ObjectId,
    ref: "QuestionSolve",
  },
  courseId: {
    type: ObjectId,
    ref: "Course",
  },
  URL: [String],
  image: [String],
  file: [String],
  createdBy: {
    type: ObjectId,
    ref: "Admin",
  },
  updatedBy: {
    type: ObjectId,
    ref: "Admin",
  },
  notes: String,
  isDeleted: {
    type: Boolean,
    default: false,
  },
  optionType: String,
});

QuestionSchema.plugin(timestamps);
question.initHooks(QuestionSchema);
QuestionSchema.index({ title: 1 });

module.exports = mongoose.model("Question", QuestionSchema);
