//Student Bookmark Question Model
const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").SchemaTypes;

const studentBookmarkQuestion = mongoose.Schema({
  studentId: {
    type: ObjectId,
    ref: "Student",
    required: true,
  },
  questions: [
    {
      type: ObjectId,
      ref: "Question",
    },
  ],
});

module.exports = mongoose.model(
  "StudentBookmarkQuestion",
  studentBookmarkQuestion
);
