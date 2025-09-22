const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const { ObjectId } = require('mongoose').SchemaTypes;
const lecture = require('./middleware/lecture');

const LectureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  subjectId: {
    type: ObjectId,
    ref: 'Subject',
    required: true,
  },
  videoContents: [{
    type: ObjectId,
    ref: 'Content',
  }],
  fileContents: [{
    type: ObjectId,
    ref: 'Content',
  }],
}, { autoCreate: true });

LectureSchema.plugin(timestamps);
LectureSchema.index({ name: 1, subjectId: 1 }, { unique: true });
lecture.initHooks(LectureSchema);

module.exports = mongoose.model('Lecture', LectureSchema);
