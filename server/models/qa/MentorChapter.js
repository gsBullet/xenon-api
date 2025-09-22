const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").SchemaTypes;

// Array of courses mentor have access
const mentorChapter = mongoose.Schema({
  mentorId: {
    type: ObjectId,
    ref: "Admin",
    required: true,
  },
  // Array of courses mentor have access
  chapters: [
    {
      type: ObjectId,
      ref: "Chapter",
    },
  ],
});

module.exports = mongoose.model("MentorChapter", mentorChapter);
