const dao = require('../data');
const utils = require('../lib/utils');

module.exports = {
  createBranch: async (req, res) => {
    try {
      const createdBranch = await dao.branch.create(req.body);
      res.ok(createdBranch);
      res.ok();
    } catch (err) {
      const isDuplicateErr = utils.isDuplicateDocument(err.message);
      if (isDuplicateErr) {
        res.conflict({ title: 'Branch name already exist' });
        return;
      }
      res.serverError(err);
    }
  },
  branches: async (req, res) => {
    try {
      const branches = await dao.branch.getAll();
      res.ok(branches);
    } catch (err) {
      res.serverError(err);
    }
  },
  deleteBranch: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedBranch = await dao.branch.updateById(id, { isDeleted: true });
      if (!updatedBranch) {
        res.notFound({ title: 'Branch not found' });
        return;
      }
      res.ok(updatedBranch);
    } catch (err) {
      res.serverError(err);
    }
  },
  updateBranch: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedBranch = await dao.branch.updateById(id, req.body);
      if (!updatedBranch) {
        res.notFound({ title: 'Branch not found' });
        return;
      }
      res.ok(updatedBranch);
    } catch (err) {
      const isDuplicateErr = utils.isDuplicateDocument(err.message);
      if (isDuplicateErr) {
        res.conflict({ title: 'Branch name already exist' });
        return;
      }
      res.serverError(err);
    }
  },
};
