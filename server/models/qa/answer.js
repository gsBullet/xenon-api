const { ref } = require("joi");
const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").SchemaTypes;

const answer = mongoose.Schema({
  questionId: {
    type: ObjectId,
    ref: "QuestionAsked",
    required: true,
  },
  mentorId: {
    type: ObjectId,
    ref: "Admin",
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  media: [
    {
      mediaType: {
        type: String,
        required: false,
      },
      mediaUrl: {
        type: String,
        required: false,
      },
    },
  ],
});

module.exports = mongoose.model("Answer", answer);
