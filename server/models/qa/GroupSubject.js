//Student Bookmark Question Model
const mongoose = require("mongoose");
const course = require("../../data/impl/mongo/course");
const { ObjectId } = require("mongoose").SchemaTypes;

const groupSubject = mongoose.Schema({
  groupId: {
    type: ObjectId,
    ref: "Group",
    required: true,
  },
  courseId: {
    type: ObjectId,
    ref: "Course",
    required: true,
  },
  subjects: [
    {
      type: ObjectId,
      ref: "Subject",
    },
  ],
});

module.exports = mongoose.model("GroupSubject", groupSubject);
