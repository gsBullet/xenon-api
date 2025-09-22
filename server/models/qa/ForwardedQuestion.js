//Student Bookmark Question Model
const mongoose = require("mongoose");
const { lock } = require("../../routes/admin");
const { ObjectId } = require("mongoose").SchemaTypes;

const forwardedQuestion = mongoose.Schema({
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
  forwardedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ForwardedQuestion", forwardedQuestion);
