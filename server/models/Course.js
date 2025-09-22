const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const { ObjectId } = require('mongoose').SchemaTypes;

const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  image: String,
  subjects: [{
    type: ObjectId,
    ref: 'Subject',
  }],
  isDeleted: Boolean,
  exams: [{
    type: ObjectId,
    ref: 'Exams',
  }],
  session: {
    type: String,
    required: true,
  },
});
CourseSchema.plugin(timestamps);
CourseSchema.index({ name: 1, session: 1 }, { unique: true });
module.exports = mongoose.model('Course', CourseSchema);
