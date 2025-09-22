//Student Bookmark Question Model
const mongoose = require("mongoose");
const { token } = require("morgan");
const { notification } = require("../../constants");
const { ObjectId } = require("mongoose").SchemaTypes;

const userNotification = mongoose.Schema({
  userId: {
    type: ObjectId,
    required: true,
    refPath: "userType",
  },
  userType: {
    type: String,
    enum: ["Admin", "Student"],
    required: true,
  },
  notifications: [
    {
      nId: {
        type: ObjectId,
        required: true,
        ref: "FBNotification",
      },
      seen: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

module.exports = mongoose.model("UserNotification", userNotification);
