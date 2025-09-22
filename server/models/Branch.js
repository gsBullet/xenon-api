const mongoose = require('mongoose');
const timestampsPlugin = require('mongoose-timestamp');

const BranchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  division: {
    type: String,
  },
  address: {
    type: String,
  },
  phone: {
    type: String,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});
BranchSchema.index({ name: 1, createdAt: 1 }, { unique: true });
BranchSchema.plugin(timestampsPlugin);
module.exports = mongoose.model('Branch', BranchSchema);
