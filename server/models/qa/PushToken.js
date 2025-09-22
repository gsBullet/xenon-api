//Student Bookmark Question Model
const mongoose = require("mongoose");
const { token } = require("morgan");
const { ObjectId } = require("mongoose").SchemaTypes;

const pushToken = mongoose.Schema({
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
  token: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("PushToken", pushToken);
