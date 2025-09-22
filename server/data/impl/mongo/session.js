const Session = require('../../../models/Session');

module.exports = {
  create: async (data) => {
    const session = await Session.findOneAndUpdate(
      { username: data.username },
      data,
      { new: true, upsert: true },
    );
    return session;
  },
  getByUsername: async (username) => {
    const session = await Session.findOne({ username });
    return session;
  },
  deleteByUsername: async (username) => {
    const session = await Session.findOneAndDelete({ username });
    return session;
  },
};
