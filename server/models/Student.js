const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').SchemaTypes;
const timestamps = require('mongoose-timestamp');
const constants = require('../constants');
const studentMethods = require('./methods/Student');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  profilePic: {
    type: String,
  },
  password: {
    type: String,
  },
  contact: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    default: constants.student.status.PENDING,
  },
  HSCGPA: {
    type: Number,
  },
  SSCGPA: {
    type: Number,
  },
  firstTime: {
    type: Boolean,
    default: true,
  },
  session: {
    type: String,
  },
  code: {
    type: String,
    required: false,
    default: '',
  },
  link: {
    type: String,
    required: false,
    default: '',
  },
  branch: {
    type: ObjectId,
    ref: 'Branch',
    required: true,
  },
  courses: [{
    type: ObjectId,
    ref: 'Course',
  }],
  exams: [{
    exam: {
      type: ObjectId,
      ref: 'Exam',
    },
    submittedAt: {
      type: Number,
      default: 0,
    },
    startsAt: {
      type: Number,
      default: 0,
    },
    setCode: {
      type: Number,
      required: true,
    },
  }],
  groups: [{
    type: ObjectId,
    ref: 'Group',
  }],
  notifications: [{
    isSeen: Boolean,
    notificationId: {
      type: ObjectId,
      ref: 'Notification',
    },
  }],
  sid: {
    type: String,
    index: true,
    unique: true,
  },
});

StudentSchema.plugin(timestamps);
StudentSchema.methods.removeSensitive = studentMethods.removeSensitive;

module.exports = mongoose.model('Student', StudentSchema);
