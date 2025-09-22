//Student Bookmark Question Model
const mongoose = require("mongoose");
const { lock } = require("../../routes/admin");
const { ObjectId } = require("mongoose").SchemaTypes;

const questionLock = mongoose.Schema({
  userId: {
    type: ObjectId,
    required: true,
    ref: "Admin",
  },
  questionId: {
    type: ObjectId,
    ref: "QuestionAsked",
    required: true,
  },
  lockedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("QuestionLock", questionLock);
