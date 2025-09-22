const { response } = require("express");
const constants = require("../../../constants");
const Admin = require("../../../models/Admin");
const MentorSubject = require("../../../models/qa/SeniorMentorSubject");
const Comment = require("../../../models/qa/comment");
const Question = require("../../../models/qa/question");
const admin = require("../../admin");
const subject = require("./subject");
const MentorChapter = require("../../../models/qa/MentorChapter");
const { name } = require("xlsx-populate/lib/RichTextFragment");
const chapter = require("./chapter");

module.exports = {
  getAll: async () => {
    const admins = await Admin.find({ hidden: { $ne: true } })
      .select(["-password", "-verificationCode"])
      .lean();
    return admins;
  },
  create: async (data) => {
    try {
      const admin = new Admin(data);
      const newAdmin = await admin.save();
      if (newAdmin) {
        const JO = JSON.stringify(newAdmin);
        return JSON.parse(JO);
      }
      return Promise.reject(new Error("Data base query failed"));
    } catch (err) {
      return Promise.reject(err);
    }
  },
  findByUsername: async (username) => {
    const admin = await Admin.findOne({ username });
    return admin;
  },
  findByEmailOrUsername: async (handle) => {
    const admin = await Admin.findOne({
      $or: [{ username: handle }, { email: handle }],
    });
    console.log("admin", admin);
    return admin;
  },
  updateById: async (id, data) => {
    const admin = await Admin.findByIdAndUpdate(id, data, { new: true })
      .select("-password")
      .lean();
    return admin;
  },
  findById: async (id) => {
    const admin = await Admin.findById(id).lean();
    return admin;
  },
  findByEmail: async (email) => {
    const admin = await Admin.findOne({ email }).lean();
    return admin;
  },
  deleteByUsername: async (username) => {
    const admin = await Admin.findOneAndDelete({ username });
    return admin;
  },
  analitycs: async () => {
    const total = await Admin.countDocuments({ hidden: { $ne: true } });
    const admins = await Admin.find({ hidden: { $ne: true } });
    const roles = Object.values(constants.admin.roles);
    const ret = {};
    roles.forEach((r) => {
      ret[r] = ret[r] || 0;
      admins.forEach((a) => {
        if (a.roles.includes(r)) {
          ret[r] += 1;
        }
      });
    });
    return { total, rolesWise: ret };
  },
  getAllMentors: async ({
    searchKey,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    onlyMentors = false,
  }) => {
    console.log("searchKey", searchKey, startDate, endDate, sortBy, sortOrder);
    try {
      // let mentors = await Admin.aggregate([
      //   {
      //     // Match only mentors
      //     $match: { roles: "mentor" },
      //   },
      //   {
      //     // Lookup corresponding MentorSubject documents
      //     $lookup: {
      //       from: "mentorchapters", // The name of the MentorSubject collection
      //       localField: "_id", // The field from the Admin collection
      //       foreignField: "mentorId", // The field from the MentorSubject collection
      //       as: "mentorchapters", // The output array field
      //     },
      //   },
      //   {
      //     // Unwind the mentorSubjects array to get a flat structure
      //     $unwind: {
      //       path: "$mentorchapters",
      //       preserveNullAndEmptyArrays: true, // Preserves mentors without subjects
      //     },
      //   },
      //   {
      //     // Lookup the subjects associated with each MentorSubject
      //     $lookup: {
      //       from: "chapters", // The name of the Subject collection
      //       localField: "mentorchapters.chapters", // The array of subject IDs in MentorSubject
      //       foreignField: "_id", // The field in the Subject collection
      //       as: "chapters", // The output array field for subjects
      //     },
      //   },
      //   {
      //     // Project only the required fields
      //     $project: {
      //       username: 1,
      //       email: 1,
      //       firstName: 1,
      //       lastName: 1,
      //       adminId: 1,
      //       chapters: {
      //         _id: 1,
      //         name: 1, // Include subject name
      //         subjectId: 1, // Include course ID
      //       },
      //     },
      //   },
      // ]);

      // sort mentor by adminId
      let mentors = await Admin.find(
        { roles: "mentor" },
        { username: 1, email: 1, firstName: 1, lastName: 1, adminId: 1 }
      )
        .sort({ adminId: 1 })
        .lean()
        .exec();

      // if (onlyMentors) {
      //   return mentors;
      // }

      // console.log("mentors", mentors);

      const dateFilter =
        startDate && endDate
          ? {
              createdAt: { $gte: startDate, $lte: endDate },
            }
          : {};
      // get mentors comments with the question and upvotes and total upvotes
      for (let i = 0; i < mentors.length; i++) {
        const mentor = mentors[i];
        //get comments by date range
        const comments = await Comment.find({
          userId: mentor._id,
          userType: "Admin",
          ...dateFilter,
        })
          .populate({
            path: "questionId",
            select: "createdAt",
          })
          .lean()
          .exec();

        //group comments by questionId
        let commentsByQuestion = {};
        comments.forEach((comment) => {
          if (!comment.questionId) {
            return;
          }
          if (!commentsByQuestion[comment.questionId._id]) {
            commentsByQuestion[comment.questionId._id] = [];
          }

          // console.log(
          //   "comment created",
          //   new Date(comment.createdAt).toLocaleDateString()
          // );
          // console.log(
          //   "question created",
          //   new Date(comment.questionId.createdAt).toLocaleDateString()
          // );
          // console.log("diff", comment.createdAt - comment.questionId.createdAt);
          const date1 = new Date(comment.createdAt);
          const date2 = new Date(comment.questionId.createdAt);
          commentsByQuestion[comment.questionId._id].push(date1 - date2);
        });

        //find average response time
        let responseTime = 0;
        let totalResponseTime = 0;
        let totalquestion = 0;
        //console.log("mentorId", mentor._id);

        for (const [key, value] of Object.entries(commentsByQuestion)) {
          totalquestion += 1;
          const minTime = Math.min(...value);
          totalResponseTime += minTime;
          // console.log("key", key);
          //console.log("value", value);
        }
        // console.log("totalResponseTime", totalResponseTime);
        // console.log("totalquestion", totalquestion);
        if (totalResponseTime > 0) {
          responseTime = totalResponseTime / totalquestion;
          // convert response time to minutes

          responseTime = Math.round(responseTime / 60000);
        }

        // convert response time to minutes

        let totalUpvotes = 0;
        comments.forEach((comment) => {
          totalUpvotes += comment.upvotes;
        });

        // response time
        //let responseTime = 0;

        mentor.totalUpvotes = totalUpvotes;
        mentor.totalAnswers = comments.length;
        mentor.responseTime = responseTime;

        let chapters = [];
        // Fetch and populate mentor chapters as plain JavaScript objects
        const mentorChapters = await MentorChapter.findOne({
          mentorId: mentor._id,
        })
          .populate({
            path: "chapters",
            select: "name",
            match: { name: { $not: /^(GK|HM|H.M|[PBZCE])/ } },
            populate: {
              path: "subjectId",
              select: "name",
              populate: {
                path: "courseId",
                select: "name",
              },
            },
          })
          .lean()
          .exec();

        mentorChapters?.chapters.map((c) => {
          chapters.push({
            _id: c._id,
            name: c.name,
            subjectId: c.subjectId?._id, // Use optional chaining to avoid errors
            courseId: c.subjectId?.courseId?._id, // Use optional chaining
          });
        });
        mentor.chapters = chapters;
      }

      // if (!searchKey) {
      //   return mentors;
      // }
      // mentors = mentors.filter(
      //   (mentor) =>
      //     String(mentor.firstName)
      //       .toLowerCase()
      //       .includes(String(searchKey).toLowerCase()) ||
      //     String(mentor.lastName)
      //       .toLowerCase()
      //       .includes(String(searchKey).toLowerCase())
      // );

      //console.log("mentors", mentors);
      return mentors;
    } catch (error) {
      console.error("Error fetching mentors with subjects:", error);
      throw error;
    }
  },
  getAllSeniorMentors: async ({
    searchKey,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  }) => {
    console.log("searchKey", searchKey, startDate, endDate, sortBy, sortOrder);
    try {
      let mentors = await Admin.aggregate([
        {
          // Match only mentors
          $match: { roles: "seniorMentor" },
        },
        {
          // Lookup corresponding MentorSubject documents
          $lookup: {
            from: "seniormentorsubjects", // The name of the MentorSubject collection
            localField: "_id", // The field from the Admin collection
            foreignField: "mentorId", // The field from the MentorSubject collection
            as: "seniormentorSubjects", // The output array field
          },
        },
        {
          // Unwind the mentorSubjects array to get a flat structure
          $unwind: {
            path: "$seniormentorSubjects",
            preserveNullAndEmptyArrays: true, // Preserves mentors without subjects
          },
        },
        {
          // Lookup the subjects associated with each MentorSubject
          $lookup: {
            from: "subjects", // The name of the Subject collection
            localField: "seniormentorSubjects.subjects", // The array of subject IDs in MentorSubject
            foreignField: "_id", // The field in the Subject collection
            as: "subjects", // The output array field for subjects
          },
        },
        {
          // Project only the required fields
          $project: {
            username: 1,
            email: 1,
            firstName: 1,
            lastName: 1,
            adminId: 1,
            subjects: {
              _id: 1,
              name: 1, // Include subject name
              courseId: 1, // Include course ID
            },
          },
        },
      ]);
      const dateFilter =
        startDate && endDate
          ? {
              createdAt: { $gte: startDate, $lte: endDate },
            }
          : {};
      // get mentors comments with the question and upvotes and total upvotes
      for (let i = 0; i < mentors.length; i++) {
        const mentor = mentors[i];
        //get comments by date range
        const comments = await Comment.find({
          userId: mentor._id,
          userType: "Admin",
          ...dateFilter,
        })
          .populate({
            path: "questionId",
            select: "createdAt",
          })
          .lean()
          .exec();

        //group comments by questionId
        let commentsByQuestion = {};
        comments.forEach((comment) => {
          console.log("comment", comment);
          if (!comment.questionId) {
            return;
          }
          if (!commentsByQuestion[comment.questionId._id]) {
            commentsByQuestion[comment.questionId._id] = [];
          }

          // console.log(
          //   "comment created",
          //   new Date(comment.createdAt).toLocaleDateString()
          // );
          // console.log(
          //   "question created",
          //   new Date(comment.questionId.createdAt).toLocaleDateString()
          // );
          // console.log("diff", comment.createdAt - comment.questionId.createdAt);
          const date1 = new Date(comment.createdAt);
          const date2 = new Date(comment.questionId.createdAt);
          commentsByQuestion[comment.questionId._id].push(date1 - date2);
        });

        //find average response time
        let responseTime = 0;
        let totalResponseTime = 0;
        let totalquestion = 0;
        //console.log("mentorId", mentor._id);

        for (const [key, value] of Object.entries(commentsByQuestion)) {
          totalquestion += 1;
          const minTime = Math.min(...value);
          totalResponseTime += minTime;
          // console.log("key", key);
          //console.log("value", value);
        }
        // console.log("totalResponseTime", totalResponseTime);
        // console.log("totalquestion", totalquestion);
        if (totalResponseTime > 0) {
          responseTime = totalResponseTime / totalquestion;
          // convert response time to minutes

          responseTime = Math.round(responseTime / 60000);
        }

        // convert response time to minutes

        let totalUpvotes = 0;
        comments.forEach((comment) => {
          totalUpvotes += comment.upvotes;
        });

        // response time
        //let responseTime = 0;

        mentor.totalUpvotes = totalUpvotes;
        mentor.totalAnswers = comments.length;
        mentor.responseTime = responseTime;

        //mentor.comments = comments;
      }

      if (!searchKey) {
        return mentors;
      }
      mentors = mentors.filter(
        (mentor) =>
          String(mentor.firstName)
            .toLowerCase()
            .includes(String(searchKey).toLowerCase()) ||
          String(mentor.lastName)
            .toLowerCase()
            .includes(String(searchKey).toLowerCase())
      );

      //console.log("mentors", mentors);
      return mentors;
    } catch (error) {
      console.error("Error fetching mentors with subjects:", error);
      throw error;
    }
  },
};
