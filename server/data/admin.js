const adminMongoImpl = require("./impl/mongo/admin");
const utils = require("../lib/utils");
const constants = require("../constants");

const CODE_LENGTH = 7;

module.exports = {
  getAll: async () => adminMongoImpl.getAll(),
  create: async (data) => {
    const verificationCode = await utils.cryptoRandomString(CODE_LENGTH);
    return adminMongoImpl.create({
      ...data,
      codeGeneratedAt: Date.now(),
      verificationCode,
      verified: true,
      status: constants.admin.status.ACTIVE,
    });
  },
  findById: async (id) => adminMongoImpl.findById(id),
  findByEmail: async (id) => adminMongoImpl.findByEmail(id),
  register: async (id, data) =>
    adminMongoImpl.updateById(id, {
      ...data,
      verified: true,
      status: constants.admin.status.ACTIVE,
    }),
  updateById: async (id, data) => adminMongoImpl.updateById(id, data),
  updateVerificationCode: async (id) => {
    const verificationCode = await utils.cryptoRandomString(CODE_LENGTH);
    return adminMongoImpl.updateById(id, {
      codeGeneratedAt: Date.now(),
      verificationCode,
    });
  },
  findByUsername: async (username) => adminMongoImpl.findByUsername(username),
  findByEmailOrUsername: async (handle) =>
    adminMongoImpl.findByEmailOrUsername(handle),
  deleteByUsername: async (username) =>
    adminMongoImpl.deleteByUsername(username),
  analitycs: async () => adminMongoImpl.analitycs(),
  getAllMentors: async (data) => adminMongoImpl.getAllMentors(data),
  getAllSeniorMentors: async (data) => adminMongoImpl.getAllSeniorMentors(data),
};
