const { ObjectId } = require("mongoose").Types;
const Group = require("../../../models/Group");
const Exam = require("../../../models/Exam");
const constants = require("../../../constants");
const { update } = require("./chapter");
const { end } = require("../../../lib/winston");

module.exports = {
  create: async (data) => {
    const group = await new Group(data).save();
    return group;
  },
  updateGroupNameImage: async ({ id, name, image }) => {
    const group = await Group.findOneAndUpdate(
      { _id: id },
      { name, image },
      { new: true }
    );
    return group;
  },
  getAll: async (session, courseId) => {
    let query = {};
    if (session && courseId) {
      query = { session, courseId };
    } else if (session) {
      query = { session };
    } else if (courseId) {
      query = { courseId };
    }
    const groups = await Group.find(query).sort({ _id: 1 });
    return groups;
  },
  getById: async (id) => {
    const groups = await Group.findOne({ _id: id })
      .populate({
        path: "exams.examId",
        model: "Exam",
      })
      .populate({
        path: "lectures.lectureId",
        model: "Lecture",
      })
      .populate({
        path: "chapters.chapterId",
        model: "Chapter",
      })
      .populate({
        path: "questionSolves.questionSolveId",
        model: "QuestionSolve",
      })
      .lean();

    console.log("group id", id);
    return groups;
  },
  // findExam: async (groupId, examId) => {
  //   console.log('Finding exam:', examId, 'in group:', groupId);
  //   try {
  //     const group = await Group.findOne({
  //       _id: groupId,
  //     });// Assuming 'examId' is the name of the referenced model in 'exams'
  //     if (!group) {
  //       console.log('Group not found');
  //       return null;
  //     }
  //     console.log('Found group:', group.exams);
  //     const exam = group.exams.find((ex) => ex._id.toString() === examId);
  //     if (!exam) {
  //       console.log('Exam not found');
  //       return null;
  //     }
  //     console.log('Found exam:', exam);
  //     return exam;
  //   } catch (error) {
  //     console.error('Error finding exam:', error);
  //     throw error;
  //   }
  // },
  updateCounterOfStudent: async (id, quantity) => {
    if (!quantity) return {};
    const group = await Group.findOneAndUpdate(
      { _id: id },
      {
        $inc: { totalStudents: quantity },
      }
    );
    return group;
  },
  addLectureAccess: async (groupId, lectureId) => {
    const group = await Group.findOneAndUpdate(
      { _id: groupId },
      { $addToSet: { lectures: { lectureId } } },
      { new: true }
    );
    return group;
  },
  addExamAccess: async (groupId, exam) => {
    const group = await Group.findOneAndUpdate(
      { _id: groupId },
      { $addToSet: { exams: exam } },
      { new: true }
    );
    return group;
  },
  removeExamAccess: async (groupId, examId) => {
    const group = await Group.findOneAndUpdate(
      { _id: groupId, "exams.examId": examId },
      { $set: { "exams.$.status": constants.exam.status.UNPUBLISHED } },
      { new: true }
    );
    return group;
  },
  removeExam: async (groupId, examId) => {
    const group = await Group.findOneAndUpdate(
      { _id: groupId, "exams.examId": examId },
      { $pull: { exams: { examId } } }
    );
    return group;
  },
  addChapterAccess: async (groupId, chapterId) => {
    const group = await Group.findOneAndUpdate(
      { _id: groupId },
      { $addToSet: { chapters: { chapterId } } },
      { new: true }
    );
    return group;
  },
  addQuestionSolveAccess: async (groupId, questionSolveId) => {
    const group = await Group.findOneAndUpdate(
      { _id: groupId },
      { $addToSet: { questionSolves: { questionSolveId } } },
      { new: true }
    );
    return group;
  },
  updateAccessStatusOfQuestionSolve: async (
    questionSolveId,
    groupId,
    status
  ) => {
    const group = await Group.findOneAndUpdate(
      { _id: groupId, "questionSolves.questionSolveId": questionSolveId },
      { $set: { "questionSolves.$.showStatus": status } },
      { new: true }
    );
    return group;
  },
  updateAccessStatusOfChapter: async (chapterId, groupId, status) => {
    const group = await Group.findOneAndUpdate(
      { _id: groupId, "chapters.chapterId": chapterId },
      { $set: { "chapters.$.showStatus": status } },
      { new: true }
    );
    return group;
  },
  updateAccessStatusOfLecture: async (lectureId, groupId, status) => {
    const group = await Group.findOneAndUpdate(
      { _id: groupId, "lectures.lectureId": lectureId },
      { $set: { "lectures.$.showStatus": status } },
      { new: true }
    );
    return group;
  },
  getAllGroupsByChapterId: async (chapterId) => {
    const exams = await Group.find({ "chapters.chapterId": chapterId });
    return exams;
  },
  getAllGroupsByQuestionSolveId: async (qid) => {
    const exams = await Group.find({ "chapters.chapterId": qid });
    return exams;
  },
  getAllGroupsByLectureId: async (lectureId) => {
    const exams = await Group.find({ "lectures.lectureId": lectureId });
    return exams;
  },
  updateExam: async (groupId, examId, data) => {
    const group = await Group.findOneAndUpdate(
      { _id: groupId, "exams.examId": examId },
      { $set: { "exams.$": { ...data } } },
      { new: true }
    );
    return group;
  },
  updateExamMoveToPractice: async (examIds) => {
    // first check in group if moveToPractice is true, then set is isPracticeExam to true in exam
    console.log("updateExamMoveToPractice", examIds);
    try {
      // const groupArray = await Group.find({
      //   _id: groupId,
      //   "exams.examId": examId,
      // })
      //   .limit(1)
      //   .exec();

      // console.log("groupArray", groupArray);

      // const group = groupArray && groupArray.length > 0 ? groupArray[0] : null;

      // if (!group) {
      //   console.log(
      //     `No group found with groupId: ${groupId}, examId: ${examId}, and moveToPractice: true`
      //   );
      //   return null; // Early return if no matching group is found
      // }

      // if (group) {
      //   const exam = group.exams.find(
      //     (e) => e.examId.toString() === examId && e.moveToPractice
      //   );
      //   if (exam) {
      //     const updatedExam = await Exam.findOneAndUpdate(
      //       { _id: examId },
      //       { isPracticeExam: true, $unset: { endsAt: 1 } },
      //       { new: true }
      //     );
      //     // add in redis id of exam

      //     console.log("Exam updated to practice", updatedExam);
      //     return updatedExam;
      //   }

      //   console.log(
      //     `updateExamMoveToPractice No exam found with groupId: ${groupId}, examId: ${examId}, and moveToPractice: true`
      //   );
      //   return exam;
      // }
      const updatedExams = await Exam.updateMany(
        { _id: { $in: examIds } },
        { isPracticeExam: true, $unset: { endsAt: 1 } }
      );
      return updatedExams;
    } catch (err) {
      console.log("Error in updateExamMoveToPractice", err);
      return Promise.reject(err);
    }
  },
  updateStatus: async (groupId, examId, status) => {
    const setter = { "exams.$.status": status };
    if (status === constants.exam.status.RESULT_PUBLISHED) {
      setter["exams.$.publishedAt"] = Date.now();
    }
    const group = await Group.findOneAndUpdate(
      { _id: groupId, "exams.examId": examId },
      { $set: setter },
      { new: true }
    );
    return group;
  },
  countByCourseId: async (courseId) => {
    const num = await Group.countDocuments({ courseId });
    return num;
  },
  countBySession: async (session) => {
    const num = await Group.countDocuments({ session });
    return num;
  },
  analitycs: async (cid) => {
    const courseId = ObjectId(cid);
    const [students] = await Promise.all([
      Group.aggregate([
        { $match: { courseId } },
        {
          $group: {
            _id: "$_id",
            total: { $sum: "$totalStudents" },
            name: { $first: "$name" },
          },
        },
      ]),
    ]);
    const obj = {};
    obj[cid] = students;
    return obj;
  },
  groupExam: async (gid) => {
    const group = await Group.findOne({ _id: gid });

    let total = 0;
    let resultPublished = 0;
    let published = 0;
    let scheduled = 0;
    let unpublished = 0;
    const { SCHEDULED, CREATED, RESULT_PUBLISHED, PUBLISHED, UNPUBLISHED } =
      constants.exam.status;
    if (group && group.exams) {
      total = group.exams.length;
      group.exams.forEach(({ status }) => {
        scheduled += status === SCHEDULED || status === CREATED ? 1 : 0;
        published += status === PUBLISHED ? 1 : 0;
        resultPublished += status === RESULT_PUBLISHED ? 1 : 0;
        unpublished += status === UNPUBLISHED ? 1 : 0;
      });
    }
    const obj = {};
    obj[gid] = {
      name: group.name,
      total,
      scheduled,
      resultPublished,
      published,
      unpublished,
    };
    return obj;
  },
  getAllGroupByExamId: async (examId) => {
    try {
      const groups = await Group.find({ "exams.examId": examId });
      return groups;
    } catch (err) {
      return Promise.reject(err);
    }
  },
};
