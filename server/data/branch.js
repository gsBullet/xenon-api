const branchMongoImpl = require('./impl/mongo/branch');

module.exports = {
  create: async (data) => branchMongoImpl.create(data),
  getAll: async () => branchMongoImpl.getAll(),
  updateById: async (id, data) => branchMongoImpl.update(id, data),
  analitycs: async () => branchMongoImpl.analitycs(),
};
