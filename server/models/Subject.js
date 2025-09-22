const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').SchemaTypes;

const timestamps = require('mongoose-timestamp');

const SubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  courseId: {
    type: ObjectId,
    ref: 'Course',
    required: true,
  },
  description: String,
  image: {
    type: String,
  },
  lectures: [{
    type: ObjectId,
    ref: 'Lecture',
  }],
  questionSolves: [{
    type: ObjectId,
    ref: 'QuestionSolve',
  }],
  chapters: [{
    type: ObjectId,
    ref: 'Chapter',
  }],
}, { autoCreate: true });

SubjectSchema.plugin(timestamps);
SubjectSchema.index({ name: 1, courseId: 1 }, { unique: true });
module.exports = mongoose.model('Subject', SubjectSchema);
