/* eslint-disable */
/* eslint-disable global-require */
const { init } = require('./initEnv');

const run = async () => {
  await init();
  const Exam = require('../server/models/Exam');
  const Group = require('../server/models/Group');
  const exams = await Exam.find({ isDeleted: true });
  console.log(`Got ${exams.length} deleted exams`);
  for await (let exam of exams) {
    const groups = await Group.find({ 'exams.examId': exam._id });
    console.log(`Found ${groups.length} number of groups for deleted exam: ${exam._id}`);
    for await (let group of groups) {
      const removedGroup = await Group.findOneAndUpdate(
        { _id: group._id, 'exams.examId': exam._id },
        { $pull: { exams: { examId: exam._id } } },
      );
      if (!removedGroup) {
        console.log(`Group remove failed: ${group._id}`);
      } else {
        console.log(`Removed exam from group ${removedGroup._id}`);
      }
    }
  }
  console.log(`Migration done`);
  process.exit();
};
run();
