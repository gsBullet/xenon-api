const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const { ObjectId } = require('mongoose').SchemaTypes;

const CompletionSchema = mongoose.Schema({
  studentId: {
    type: ObjectId,
    ref: 'Student',
  },
  subjectId: {
    type: ObjectId,
    ref: 'Subject',
  },
  courseId: {
    type: ObjectId,
    ref: 'Course',
  },
  video: [{
    type: ObjectId,
    ref: 'Content',
  }],
  file: [{
    type: ObjectId,
    ref: 'Content',
  }],
});

CompletionSchema.plugin(timestamps);
CompletionSchema.index({ studentId: 1, subjectId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Completion', CompletionSchema);
