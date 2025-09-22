const Exam = require('../../../models/Exam');
const File = require('../../../models/File');

module.exports = {
  create: async (data) => {
    const file = await new File(data).save();
    const ret = await Exam.populate(file, {
      path: 'exams',
      select: 'title _id',
    });
    return ret;
  },
  getFiles: async () => {
    const files = await File
      .find({})
      .populate({
        path: 'exams',
        select: 'title _id',
      });
    return files;
  },
};
