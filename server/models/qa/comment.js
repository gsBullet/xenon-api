const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").SchemaTypes;

const comment = mongoose.Schema({
  // answerId: {
  //   type: ObjectId,
  //   ref: "Answer",
  //   required: true,
  // },
  questionId: {
    type: ObjectId,
    ref: "QuestionAsked",
    required: true,
  },
  reply: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ["Admin", "Student"],
    required: true,
  },
  userId: {
    type: ObjectId,
    required: true,
    refPath: "userType",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  editCount: {
    type: Number,
    default: 0,
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

module.exports = mongoose.model("Comment", comment);
