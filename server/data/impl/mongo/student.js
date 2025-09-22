const { ObjectId } = require("mongoose").Types;
const mongoose = require("mongoose");
const constants = require("../../../constants");
const Group = require("../../../models/Group");
const Student = require("../../../models/Student");
const GroupSubject = require("../../../models/qa/GroupSubject");
const s = require("connect-redis");
const { getById } = require("./group");

const { sensitivityLevel } = constants;
const selectField = [
  "name",
  "_id",
  "session",
  "username",
  "branch",
  "courses",
  "HSCGPA",
  "SSCGPA",
  "contact",
  "group",
  "status",
  "groups",
  "sid",
  "firstTime",
  "profilePic",
  "code",
  "link",
];
module.exports = {
  create: async (data) => {
    const newStudent = new Student(data);
    const createdStudent = await newStudent.save();
    const student = createdStudent.removeSensitive(sensitivityLevel.ADMIN);
    return student;
  },
  getByUsername: async (username, level = sensitivityLevel.ADMIN) => {
    let student = await Student.findOne({ username });
    if (student) {
      student = student.removeSensitive(level);
    }
    return student;
  },
  getById: async (id) => {
    const student = await Student.findById(id);

    return student;
  },
  getByStudentId: async (sid, level = sensitivityLevel.ADMIN) => {
    console.log("getByStudentId called", sid);
    let student = await Student.findOne({ sid });
    if (student) {
      student = student.removeSensitive(level);
    }
    return student;
  },
  getProfile: async (id, level = sensitivityLevel.APP_USER) => {
    let student = await Student.findById(id)
      .populate("branch")
      .populate("courses")
      .populate("groups")
      .populate("notifications.notificationId");
    if (student) {
      student = student.removeSensitive(level);
    }
    return student;
  },
  getCourseByStudentWithSubjectAndChapter: async (
    id,
    level = sensitivityLevel.APP_USER
  ) => {
    let student = await Student.findById(id)
      .populate({
        path: "courses",
        select: "name image description",
        populate: {
          path: "subjects",
          select: "name",
          populate: {
            path: "chapters",
            select: "name",
            match: { name: { $not: /^(GK|HM|H.M|[PBZCE])/ } },
          },
        },
      })
      .populate({
        path: "groups",
        select: "name courseId",
      });

    if (student) {
      student = student.removeSensitive(level);
    }

    console.log("student groups", student.groups);

    const qaGroupAccess = {};
    for (let i = 0; i < student.groups.length; i++) {
      console.log("group", student.groups[i]);
      const groupSubjects = await GroupSubject.findOne({
        groupId: student.groups[i]._id,
      }).populate("subjectId");

      if (groupSubjects && groupSubjects.subjects.length > 0) {
        console.log("groupSubjects", groupSubjects.subjects);
        // push groupSubjects to course with courseId and include if course already exists
        console.log("course Id", student.groups[i].courseId);
        if (qaGroupAccess[student.groups[i].courseId] === undefined) {
          console.log(
            "qaGroupAccess 1",
            qaGroupAccess[student.groups[i].courseId]
          );
          qaGroupAccess[student.groups[i].courseId] = groupSubjects.subjects;
        } else {
          console.log(
            "qaGroupAccess 2",
            qaGroupAccess[student.groups[i].courseId]
          );
          qaGroupAccess[student.groups[i].courseId] = [
            ...qaGroupAccess[student.groups[i].courseId],
            ...groupSubjects.subjects,
          ];
        }
      }
    }

    console.log("qaGroupAccess", qaGroupAccess);

    const studentCourses = student.courses.map((course) => {
      const courseIdStr = course._id.toString(); // Ensure courseId is a string
      return {
        ...course, // Ensure to get a plain object if it's a Mongoose document
        qa: qaGroupAccess[courseIdStr] || [], // Attach the qaGroupAccess subjects
      };
    });

    console.log("studentCourses", studentCourses);

    // console.log("courses", course);

    // const groupSubjects = await GroupSubject.find({
    //   groupId: { $in: student.groups.map((group) => group._id) },
    // }).populate("subjectId");

    // console.log("groupSubjects", groupSubjects);

    return studentCourses;
  },
  getCourseByStudent: async (id, level = sensitivityLevel.APP_USER) => {
    let student = await Student.findById(id).populate("courses");

    if (student) {
      student = student.removeSensitive(level);
    }

    return student.courses;
  },

  getProfileFromDB: async (id, level = sensitivityLevel.APP_USER) => {
    const currentDate = Date.now();
    let student = await Student.findById(id)
      .populate("branch")
      .populate("courses")
      .populate("groups")
      .populate("notifications.notificationId");
    if (student) {
      student = student.removeSensitive(level);
    }
    console.log(
      "getProfile student database called time needed for ",
      id,
      " ",
      Date.now() - currentDate
    );
    return student;
  },
  addCourseForStudent: async (id, course, level = sensitivityLevel.ADMIN) => {
    let student = await Student.findByIdAndUpdate(
      id,
      { $addToSet: { courses: course } },
      { new: true }
    );
    if (student) {
      student = student.removeSensitive(level);
    }
    return student;
  },
  addAlternateExamCode: async (sid, code, link) => {
    let student = await Student.findOneAndUpdate(
      { sid },
      { $set: { code, link } },
      { new: true }
    );
    if (student) {
      student = student.removeSensitive(sensitivityLevel.ADMIN);
    }
  },
  getAlternateExam: async (sid) => {
    let student = await Student.findOne({ sid }, { code: 1, link: 1 });
    if (student) {
      student = student.removeSensitive(sensitivityLevel.ADMIN);
    }
    return student;
  },
  updateById: async (id, data) => {
    let student = await Student.findByIdAndUpdate(id, data, { new: true });
    if (student) {
      student = student.removeSensitive(sensitivityLevel.ADMIN);
    }
    return student;
  },
  updateByUsername: async (username, data) => {
    let student = await Student.findOneAndUpdate({ username }, data, {
      new: true,
    });
    if (student) {
      student = student.removeSensitive(sensitivityLevel.ADMIN);
    }
    return student;
  },
  removeCourseForStudent: async (
    id,
    course,
    level = sensitivityLevel.ADMIN
  ) => {
    let student = await Student.findByIdAndUpdate(
      id,
      { $pull: { courses: { $in: course } } },
      { new: true }
    );
    if (student) {
      student = student.removeSensitive(level);
    }
    return student;
  },
  updateStatus: async (students, status) => {
    const student = await Student.updateMany(
      { username: { $in: students } },
      { $set: { status } },
      { multi: true }
    );
    return student;
  },
  addGroupForStudent: async (usernames, groupId, courseId) => {
    // eslint-disable-next-line no-param-reassign
    courseId = ObjectId(courseId);
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const student = await Student.updateMany(
        {
          $and: [
            { username: { $in: usernames } },
            { courses: { $elemMatch: { $eq: courseId } } },
          ],
        },
        { $addToSet: { groups: groupId } },
        { multi: true }
      ).session(session);
      const group = await Group.findOneAndUpdate(
        { _id: groupId },
        { $inc: { totalStudents: student.nModified } },
        { new: true }
      );
      await session.commitTransaction();
      return { student, group };
    } catch (err) {
      await session.abortTransaction();
      return Promise.reject(err);
    } finally {
      await session.endSession();
    }
  },
  removeGroupForStudent: async (usernames, group) => {
    const student = await Student.updateMany(
      { username: { $in: usernames } },
      { $pull: { groups: { $in: group } } },
      { new: true }
    );
    return student;
  },
  getStudents: async ({
    session,
    branch,
    lastId,
    sid,
    username,
    name,
    courseId,
    startDate,
    endDate,
    all,
  }) => {
    const query = [];
    if (name) query.push({ name: { $regex: name, $options: "i" } });
    if (sid) query.push({ sid: { $regex: sid, $options: "i" } });
    if (username) query.push({ username: { $regex: username, $options: "i" } });
    if (branch) query.push({ branch });
    if (session) query.push({ session });
    if (courseId) query.push({ courses: { $in: [courseId] } });
    if (startDate) query.push({ createdAt: { $gte: new Date(startDate) } });
    if (endDate) query.push({ createdAt: { $lte: new Date(endDate) } });

    let students = [];
    if (all) {
      students = await Student.find(
        { $and: query.length ? query : [{}] },
        selectField
      )
        .sort({ _id: -1 })
        .lean();
    }
    if (!lastId && !all) {
      students = await Student.find(
        { $and: query.length ? query : [{}] },
        selectField
      )
        .populate({
          path: "groups",
          select: "_id name courseId session image",
        })
        .populate({
          path: "branch",
          select: "_id name division",
        })
        .limit(50)
        .sort({ _id: -1 })
        .lean();
    }
    if (lastId && !all) {
      students = await Student.find(
        {
          $and: [{ _id: { $lt: lastId } }, ...query],
        },
        selectField
      )
        .limit(100)
        .sort({ _id: -1 })
        .lean();
    }
    return students;
  },
  studentsByGroupId: async (id) => {
    const students = await Student.find(
      { groups: { $in: [id] } },
      selectField
    ).lean();
    return students;
  },
  notificationSeenUpdate: async (id, notificationId) => {
    const student = await Student.findOneAndUpdate(
      { _id: id, "notifications.notificationId": notificationId },
      { $set: { "notifications.$.isSeen": true } }
    );
    return student;
  },
  deleteStudents: async (students) => {
    const ret = await Student.deleteMany({ username: { $in: students } });
    return ret;
  },
  getByUsernames: async (usernames) => {
    const students = await Student.find({
      username: { $in: usernames },
    }).select("-password");
    return students;
  },
  studentsCount: async (session) => {
    let query = {};
    if (session) {
      query = { session };
    }
    const [total, active, pending, deactive, firstTime] = await Promise.all([
      Student.countDocuments({ ...query }),
      Student.countDocuments({
        status: constants.student.status.ACTIVE,
        ...query,
      }),
      Student.countDocuments({
        status: constants.student.status.PENDING,
        ...query,
      }),
      Student.countDocuments({
        status: constants.student.status.DEACTIVE,
        ...query,
      }),
      Student.countDocuments({ firstTime: true, ...query }),
    ]);
    return {
      total,
      active,
      pending,
      deactive,
      firstTime,
      secondTime: total - firstTime,
    };
  },
  studentsInCourse: async (courseId) => {
    const num = await Student.countDocuments({ courses: courseId });
    return num;
  },
};
