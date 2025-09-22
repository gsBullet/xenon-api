const { ObjectId } = require("mongoose").SchemaTypes;
const { duration } = require("moment");
const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const ContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  key: {
    type: String,
  },
  URL: {
    type: String,
  },
  thumbnail: {
    type: String,
  },
  isVOD: {
    type: Boolean,
    default: false,
  },
  isAvailable: {
    type: Boolean,
    default: false,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  courses: [
    {
      type: ObjectId,
      ref: "Course",
    },
  ],
  chapters: [
    {
      type: ObjectId,
      ref: "Chapter",
    },
  ],
  lectures: [
    {
      type: ObjectId,
      ref: "Lecture",
    },
  ],
  subjects: [
    {
      type: ObjectId,
      ref: "Subject",
    },
  ],
  createdBy: {
    type: ObjectId,
    ref: "Admin",
  },
  isDrmEnabled: {
    type: String,
    default: "",
  },

  duration: {
    type: Number,
    default: 0,
  },
});

ContentSchema.plugin(timestamps);
ContentSchema.index({ title: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("Content", ContentSchema);
