//Student Bookmark Question Model
const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").SchemaTypes;

const likequestion = mongoose.Schema({
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
  questions: [
    {
      type: ObjectId,
      ref: "QuestionAsked",
    },
  ],
});

module.exports = mongoose.model("QuestionLike", likequestion);
