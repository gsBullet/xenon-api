const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const { ObjectId } = require('mongoose').SchemaTypes;
const questionSolve = require('./middleware/questionSolve');

const QuestionSolveSchema = new mongoose.Schema({
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

QuestionSolveSchema.plugin(timestamps);
QuestionSolveSchema.index({ name: 1, subjectId: 1 }, { unique: true });
questionSolve.initHooks(QuestionSolveSchema);

module.exports = mongoose.model('QuestionSolve', QuestionSolveSchema);
