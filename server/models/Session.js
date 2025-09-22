const mongoose = require('mongoose');

const timestamps = require('mongoose-timestamp');
const { ObjectId } = require('mongoose').SchemaTypes;

const SessionSchema = new mongoose.Schema({
  name: String,
  userId: ObjectId,
  username: String,
  sessionId: String,
  roles: [String],
});
SessionSchema.index({ username: 1 });
SessionSchema.plugin(timestamps);
module.exports = mongoose.model('Session', SessionSchema);
