const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const constants = require("../constants");

const AdminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    minlength: 2,
    maxlength: 20,
  },
  lastName: {
    type: String,
    minlength: 2,
    maxlength: 20,
  },
  adminId: {
    type: String,
    unique: true,
    index: true,
  },
  username: {
    type: String,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    unique: true,
    index: true,
  },
  roles: {
    type: [String],
    required: true,
  },
  verificationCode: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  codeGeneratedAt: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: constants.admin.status.PENDING,
  },
  password: {
    type: String,
    minlength: 5,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
});
AdminSchema.plugin(timestamps);
module.exports = mongoose.model("Admin", AdminSchema);
