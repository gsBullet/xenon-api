const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const constants = require('../constants');

const DummySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  instruction: {
    type: String,
  },
  comments: {
    type: String,
  },
  status: {
    type: String,
    default: constants.exam.status.CREATED,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});
DummySchema.plugin(timestamps);
DummySchema.index({ title: 1 });

module.exports = mongoose.model('Dummies', DummySchema);
