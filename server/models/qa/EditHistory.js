const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").SchemaTypes;

const editHistory = mongoose.Schema({
  commentId: {
    type: ObjectId,
    ref: "Comment",
    required: true,
  },
  reply: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  media: [
    {
      mediaType: {
        type: String,
        required: false,
      },
      mediaUrl: {
        type: String,
        required: false,
      },
    },
  ],
});

module.exports = mongoose.model("EditHistory", editHistory);
