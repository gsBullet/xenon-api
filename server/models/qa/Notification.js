const e = require("express");
const { ref } = require("joi");
const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").SchemaTypes;

const fbNotification = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["FORWARD", "NEW_QUESTION", "REPLY", "UPVOTE"],
  },
  model: {
    type: String,
    required: true,
    enum: ["QuestionAsked", "Comment", "Exam"],
  },
  modelId: {
    type: ObjectId,
    required: true,
    refPath: "model",
  },
  createdAt: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("FBNotification", fbNotification);
