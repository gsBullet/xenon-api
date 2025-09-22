const mongoose = require('mongoose');
const timestampsPlugin = require('mongoose-timestamp');
const { Mixed } = require('mongoose').SchemaTypes;

const NotificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  info: Mixed,
}, { autoCreate: true });
NotificationSchema.plugin(timestampsPlugin);

module.exports = mongoose.model('Notification', NotificationSchema);
