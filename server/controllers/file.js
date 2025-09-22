const dao = require('../data');

module.exports = {
  getFiles: async (req, res) => {
    try {
      const files = await dao.file.getFiles();
      res.ok(files);
    } catch (err) {
      res.serverError(err);
    }
  },
};
