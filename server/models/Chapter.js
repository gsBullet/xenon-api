const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const { ObjectId } = require('mongoose').SchemaTypes;
const chapter = require('./middleware/chapter');
const { bool, boolean } = require('joi');

const ChapterSchema = new mongoose.Schema({
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

ChapterSchema.plugin(timestamps);
ChapterSchema.index({ name: 1, subjectId: 1 }, { unique: true });
chapter.initHooks(ChapterSchema);

module.exports = mongoose.model('Chapter', ChapterSchema);
