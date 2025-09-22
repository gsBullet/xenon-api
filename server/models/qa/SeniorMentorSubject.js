const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").SchemaTypes;

// Array of courses mentor have access
const seniorMentorSubject = mongoose.Schema({
  mentorId: {
    type: ObjectId,
    ref: "Admin",
    required: true,
  },
  // Array of courses mentor have access
  subjects: [
    {
      type: ObjectId,
      ref: "Subject",
    },
  ],
});

module.exports = mongoose.model("SeniorMentorSubject", seniorMentorSubject);
