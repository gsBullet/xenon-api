//Student Bookmark Question Model
const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").SchemaTypes;

const upvoteAnswer = mongoose.Schema({
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
  comments: [
    {
      type: ObjectId,
      ref: "Comment",
    },
  ],
});

module.exports = mongoose.model("UpvoteAnswer", upvoteAnswer);
