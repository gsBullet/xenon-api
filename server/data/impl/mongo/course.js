const Course = require("../../../models/Course");

module.exports = {
  getAll: async (session) => {
    let query = {};
    if (session) {
      query = { session };
    }
    const courses = await Course.find(query);
    return courses;
  },
  getCourseWithSubject: async () => {
    const course = await Course.find({}).populate({
      path: "subjects",
      select: "name",
      populate: {
        path: "chapters",
        select: "name",
        match: { name: { $not: /^(GK|HM|H.M|[PBZCE])/ } },
      },
    });
    return course;
  },
  create: async (data) => {
    const newCourse = new Course(data);
    const createdCourse = await newCourse.save();
    return createdCourse;
  },
  getCourseById: async (id) => {
    const course = await Course.findOne({ _id: id });
    return course;
  },
  update: async (id, data) => {
    const updatedCourse = await Course.findOneAndUpdate({ _id: id }, data, {
      new: true,
    });
    return updatedCourse;
  },
  totalCourseBySession: async (session) => {
    let query = {};
    if (session) query = { session };
    const num = Course.countDocuments(query);
    return num;
  },
};
