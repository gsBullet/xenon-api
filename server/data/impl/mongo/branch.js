const Branch = require('../../../models/Branch');

module.exports = {
  create: async (data) => {
    const newBranch = new Branch(data);
    const createdBranch = await newBranch.save();
    return createdBranch;
  },
  getAll: async () => {
    const branches = await Branch
      .find({ $or: [{ isDeleted: null }, { isDeleted: false }] });
    return branches;
  },
  update: async (id, data) => {
    const updatedData = await Branch.findByIdAndUpdate(id, data, { new: true });
    return updatedData;
  },
  analitycs: async () => {
    const total = await Branch.countDocuments({});
    const divisionWiseBranchCount = await Branch.aggregate([
      { $match: { } },
      {
        $group: {
          _id: '$division',
          count: { $sum: 1 },
        },
      },
    ]);
    return { total, divisionWiseBranchCount };
  },
};
