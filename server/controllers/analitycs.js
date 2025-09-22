/* eslint-disable no-underscore-dangle */
const data = require('../data');

const getLectureChapterByCourseId = async (courseId) => {
  const [lecture, chapter, questionSolves] = await Promise.all([
    data.lecture.totalContentByCourseId(courseId),
    data.chapter.totalContentByCourseId(courseId),
    data.questionSolve.totalContentByCourseId(courseId),
  ]);
  const obj = {};
  obj[courseId] = { lecture, chapter, questionSolves };
  return obj;
};
const lectureChapterData = async (cids) => {
  const request = [];
  cids.forEach((c) => {
    request.push(getLectureChapterByCourseId(c._id));
  });
  const ret = await Promise.all(request);
  return ret;
};
const courseWiseData = async (courseId) => {
  const [student, group, subject] = await Promise.all([
    data.student.studentsInCourse(courseId),
    data.group.countByCourseId(courseId),
    data.subject.countByCourseId(courseId),
  ]);
  const obj = {};
  obj[courseId] = { student, group, subject };
  return obj;
};
const allCourseData = async (cids) => {
  const requests = [];
  cids.forEach((c) => {
    requests.push(courseWiseData(c));
  });
  const ret = await Promise.all(requests);
  return ret;
};

module.exports = {
  dashboard: async (req, res) => {
    try {
      const { session } = req.params;
      const courses = await data.course.getAll(session);
      const cids = courses.map((c) => c._id);
      const [students, questions, lectures, chapters, questionSolves,
        exams, totalCourseBySession, courseData, chapterLectureQustionSolveInCourse,
        totalGroupBySession, groupWiseStudent] = await Promise.all([
        data.student.studentsCount(session),
        data.question.count(cids),
        data.lecture.totalContentBySession(session),
        data.chapter.totalContentBySession(session),
        data.questionSolve.totalContentBySession(session),
        data.exam.analitycs(cids),
        data.course.totalCourseBySession(session),
        allCourseData(cids),
        lectureChapterData(cids),
        data.group.countBySession(session),
        data.group.analitycs(cids),
      ]);
      res.ok({
        students,
        questions,
        contents: { lectures, chapters, questionSolves },
        exams,
        courseData,
        chapterLectureQustionSolveInCourse,
        totalCourseBySession,
        totalGroupBySession,
        groupWiseStudent,
      });
    } catch (err) {
      res.serverError(err);
    }
  },
  activeUserCount: async (req, res) => {
    try {
      const count = await data.analitycs.getActiveUserCount();
      res.ok({ activeUsers: count });
    } catch (err) {
      res.serverError(err);
    }
  },
  branchAndAdmins: async (req, res) => {
    try {
      const [branch, admin] = await Promise.all([
        data.branch.analitycs(),
        data.admin.analitycs(),
      ]);
      res.ok({ branch, admin });
    } catch (err) {
      res.serverError(err);
    }
  },
  groupWiseExamByCourseId: async (req, res) => {
    try {
      const { courseId, session } = req.params;
      const groups = await data.group.getAll(session, courseId);
      const requests = [];
      const group = {};
      groups.forEach((g) => {
        group[g._id] = g.name;
        requests.push(data.group.groupExam(g._id));
      });

      const ret = await Promise.all(requests);
      res.ok({ groupWiseExam: ret, groups: group });
    } catch (err) {
      res.serverError(err);
    }
  },
  allRequestCounts: async (req, res) => {
    try {
      const requests = await data.analitycs.getAllRequestCounts();
      res.ok({ requests });
    } catch (err) {
      res.serverError(err);
    }
  },
};
