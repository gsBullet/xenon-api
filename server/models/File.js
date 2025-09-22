const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const { ObjectId } = require('mongoose').SchemaTypes;

const FileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  exams: [{
    type: ObjectId,
    ref: 'Exam',
  }],
  URL: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
});

FileSchema.plugin(timestamps);
FileSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('File', FileSchema);
