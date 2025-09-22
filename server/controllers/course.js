const dao = require("../data");
const { getCourseWithSubject } = require("../data/course");
const utils = require("../lib/utils");

module.exports = {
  createNewCourse: async (req, res) => {
    try {
      const course = await dao.course.create(req.body);
      res.ok(course);
    } catch (err) {
      const isDuplicateErr = utils.isDuplicateDocument(err.message);
      if (isDuplicateErr) {
        res.conflict({ title: "Course already exist" });
        return;
      }
      res.serverError(err);
    }
  },
  updateCourse: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedCourse = await dao.course.update(id, req.body);
      if (!updatedCourse) {
        res.notFound({ title: "Course not found" });
        return;
      }
      res.ok(updatedCourse);
    } catch (err) {
      const isDuplicateErr = utils.isDuplicateDocument(err.message);
      if (isDuplicateErr) {
        res.conflict({ title: "Course already exist" });
        return;
      }
      res.serverError(err);
    }
  },
  courses: async (req, res) => {
    try {
      const { session } = req.query;
      const courses = await dao.course.getAll(session);
      res.ok(courses);
    } catch (err) {
      res.serverError(err);
    }
  },
  getCourseWithSubject: async (req, res) => {
    try {
      const course = await getCourseWithSubject();
      res.ok(course);
    } catch (err) {
      res.serverError(err);
    }
  },
  coursesById: async (req, res) => {
    try {
      const course = await dao.course.getCourseById(req.params.courseId);
      res.ok(course);
    } catch (err) {
      res.serverError(err);
    }
  },
  allSubjectCompletion: async (req, res) => {
    try {
      const {
        user: { id: studentId },
        params: { courseId },
      } = req;
      const completion = await dao.completion.getByCourseIdAndStudentId(
        courseId,
        studentId
      );
      res.ok(completion);
    } catch (err) {
      res.serverError(err);
    }
  },
};
