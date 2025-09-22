const mongoose = require("mongoose");
const Student = require("../../../models/Student");
const Question = require("../../../models/qa/question");
const Subject = require("../../../models/Subject");
const Answer = require("../../../models/qa/answer");
const Branch = require("../../../models/Branch");
const Comment = require("../../../models/qa/comment");
const GroupSubject = require("../../../models/qa/GroupSubject");
const QuestionLike = require("../../../models/qa/QuestionLike");
const QuestionLock = require("../../../models/qa/QuestionLock");
const ForwardedQuestion = require("../../../models/qa/ForwardedQuestion");
const EditHistory = require("../../../models/qa/EditHistory");
const PushToken = require("../../../models/qa/PushToken");
const SeniorMentorSubject = require("../../../models/qa/SeniorMentorSubject");
const MentorChapter = require("../../../models/qa/MentorChapter");
const StudentBookmarkQuestion = require("../../../models/qa/StudentBookmarkQuestion");
const UpvoteAnswer = require("../../../models/qa/UpvoteAnswer");
const qaNotification = require("../../../lib/qa");
const firebaseAdmin = require("../../../lib/firebase/FirebaseAdmin");
const e = require("express");
const { question } = require("../../../constants");
const { updateStatus } = require("./student");
const s = require("connect-redis");
const { use } = require("passport");
const { setPushToken } = require("../../../controllers/qa");
const course = require("./course");
const { is } = require("bluebird");
const student = require("./student");
const { add } = require("../../../lib/winston");
const { lock, unlock } = require("../../../routes/admin");
const { Console } = require("winston/lib/winston/transports");
const chapter = require("./chapter");
const { answers } = require("../redis/examResult");

const FILTER_OPTIONS = {
  DATE: "Date",
  POPULARITY: "Popularity",
  MY_QUESTIONS: "My_Questions",
  MY_BOOKMARKS: "My_Bookmarks",
};
const incrementUpvote = async ({ commentId, questionId }) => {
  console.log("incrementUpvote", questionId);
  const comment = await Comment.findOneAndUpdate(
    { _id: commentId },
    { $inc: { upvotes: 1 } },
    { new: true }
  );

  await Question.findOneAndUpdate(
    { _id: questionId },
    { $inc: { upvotes: 1 } },
    { new: true }
  );

  return comment;
};
const decrementUpvote = async ({ commentId, questionId }) => {
  console.log("decrementUpvote", questionId, commentId);

  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, upvotes: { $gt: 0 } },
    { $inc: { upvotes: -1 } },
    { new: true }
  );

  console.log("comment", comment);

  await Question.findOneAndUpdate(
    { _id: questionId },
    { $inc: { upvotes: -1 } },
    { new: true }
  );

  return comment;
};

const incrementBookmark = async ({ questionId }) => {
  const question = await Question.findOneAndUpdate(
    { _id: questionId },
    { $inc: { bookmarks: 1 } },
    { new: true }
  );
  return question;
};

const decrementBookmark = async ({ questionId }) => {
  const question = await Question.findOneAndUpdate(
    { _id: questionId, bookmarks: { $gt: 0 } },
    { $inc: { bookmarks: -1 } },
    { new: true }
  );
  return question;
};

async function findQuestionsWithComments(subjectIds, isAdmin, query) {
  console.log("findQuestionsWithComments", subjectIds);
  try {
    const questionsWithComments = await Question.aggregate([
      {
        $lookup: {
          from: "comments", // Collection name for comments
          localField: "_id", // Field in Question model
          foreignField: "questionId", // Field in Comment model
          as: "comments", // New field in the output
        },
      },
      {
        $match: {
          "comments.0": { $exists: false },
        },
      },
      {
        $lookup: {
          from: "students", // Collection name for students
          localField: "studentId", // Field in Question model
          foreignField: "_id", // Field in Student model
          as: "student", // New field in the output
        },
      },
      {
        $unwind: "$student", // Unwind to get the student object
      },
      {
        $project: {
          _id: 1,
          title: 1, // Example field from Question
          comments: 1, // Keep comments
          studentId: {
            _id: "$student._id", // Include student _id
            name: "$student.name", // Include student name
          }, // Only include the student's name
          byAdmin: 1,
          popularity: 1,
          answers: 1,
          status: 1,
          bookmarks: 1,
          upvotes: 1,
          createdAt: 1,
          questionDescription: 1,
          media: 1,
          courseId: 1,
          subjectId: 1,
        },
      },
    ]);

    //console.log("Questions with comments:", questionsWithComments);

    //sort by date
    questionsWithComments.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });

    if (isAdmin) {
      return questionsWithComments;
    }

    const questions = questionsWithComments.filter((question) =>
      subjectIds.includes(question.subjectId)
    );

    console.log("Questions with comments:", questions);
    return questions;
  } catch (error) {
    console.error("Error finding questions with comments:", error);
  }
}

const LOCK_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const lockValid = (lockedAt) => {
  return Date.now() - lockedAt < LOCK_DURATION;
};

const FILTER_OPTIONS_ADMIN = {
  NEW_QUESTION: "NEW_QUESTION",
  NOT_ANSWERED: "NOT_ANSWERED",
  COMPLETED: "COMPLETED",
  MY_REPLIED: "MY_REPLIED",
  DECLINED: "DECLINED",
  LOCKED: "LOCKED",
  FORWARDED: "FORWARDED",
  MENTOR_ANSWERED: "MENTOR_ANSWERED",
};

module.exports = {
  create: async ({
    studentId,
    courseId,
    subjectId,
    chapterId,
    questionDescription,
    media,
  }) => {
    //check subjectid  and courseid is valid
    const subject = await Subject.findOne({
      _id: subjectId,
      courseId: courseId,
    });
    if (!subject) {
      throw new Error("Invalid Subject or Course");
    }

    const question = await new Question({
      studentId,
      courseId,
      subjectId,
      chapterId,
      questionDescription,
      media,
    }).save();
    return question;
  },
  update: async (data) => {
    // update if question is not answered, answers = 0
    // const question = await Question.findOneAndUpdate(
    //   { _id: data.questionId },
    //   data,
    //   {
    //     new: true,
    //   }
    // );

    // return question;

    const question = await Question.findOne({
      _id: data.questionId,
      answers: 0,
    });

    if (question) {
      if (question.studentId.toString() !== data.studentId.toString()) {
        throw new Error("Not authorized to update question");
      }

      const updatedQuestion = await Question.findOneAndUpdate(
        { _id: data.questionId },
        data,
        {
          new: true,
        }
      );
      return updatedQuestion;
    } else {
      throw new Error("Question is already answered");
    }
  },

  assignSubjectToGroup: async ({ groupId, courseId, subjects }) => {
    console.log("assignSubjectToGroup", groupId, courseId, subjects);
    const groupSubject = await GroupSubject.findOneAndUpdate(
      { groupId },
      { $set: { subjects, courseId } },
      { new: true, upsert: true }
    ).populate({
      path: "subjects", // assuming 'subjects' is an array of ObjectIds
      select: "id name", // only populate the 'id' and 'name' fields of the subjects
    });
    return groupSubject;
  },
  getSubjectByGroup: async (groupId) => {
    const groupSubject = await GroupSubject.findOne({ groupId }).populate({
      path: "subjects",
      select: "name",
    });
    if (!groupSubject) {
      return {
        subjects: [],
      };
    }
    return groupSubject;
  },

  getQuestions: async ({
    mentorId,
    subjectId,
    courseId,
    chapterId,
    filter,
    searchString,
    roles,
    page,
    limit,
  }) => {
    try {
      // Find the subjects the mentor has access to

      console.log(
        "getQuestions",
        roles,
        mentorId,
        courseId,
        subjectId,
        filter,
        searchString,
        chapterId
      );

      const skip = (page - 1) * limit;

      let userType = "Mentor";

      if (roles.includes("seniorMentor")) {
        userType = "SeniorMentor";
      }

      if (roles.includes("admin")) {
        userType = "Admin";
      }

      let subjectIds = [];
      let chapterIds = [];

      if (userType === "Mentor") {
        const mentor = await MentorChapter.findOne({ mentorId }).populate(
          "chapters"
        );
        if (mentor) {
          chapterIds = mentor.chapters.map((chapter) => chapter._id);
        }
      } else if (userType === "SeniorMentor") {
        const mentor = await SeniorMentorSubject.findOne({ mentorId }).populate(
          "subjects"
        );
        if (mentor) {
          subjectIds = mentor.subjects.map((subject) => subject._id);
        }
      } else if (userType === "Admin") {
        const subjects = await Subject.find({}).select("_id");
        subjectIds = subjects.map((subject) => subject._id);
      }

      const query = {};
      if (searchString) {
        query.$or = [
          { questionDescription: { $regex: searchString, $options: "i" } },
        ];
      }
      if (courseId) {
        query.courseId = courseId;
      }
      if (subjectId) {
        query.subjectId = subjectId;
      } else {
        if (userType === "SeniorMentor") {
          query.subjectId = { $in: subjectIds };
        }
      }
      if (chapterId) {
        query.chapterId = chapterId;
      } else {
        if (userType === "Mentor") {
          query.chapterId = { $in: chapterIds };
        }
      }

      console.log("userType", userType);

      if (userType == "Admin" && mentorId) {
        //query.userId = mentorId;
        // const totalRecords = await Comment.countDocuments({ userId: mentorId });
        const comments = await Comment.find({
          userId: mentorId,
        }).populate({
          path: "questionId",
          populate: [
            { path: "studentId", select: "name" },
            { path: "subjectId", select: "name" },
            { path: "statusUpdatedBy", select: "firstname lastname adminId" },
          ],
        });

        let questions = comments.map((comment) => comment.questionId);

        if (chapterId) {
          questions = questions.filter((question) => {
            if (
              question.chapterId &&
              chapterId === question.chapterId.toString()
            ) {
              return question;
            }
          });
        }

        if (subjectId) {
          questions = questions.filter((question) => {
            if (question.subjectId.toString() === subjectId) {
              return question;
            }
          });
        }

        if (courseId) {
          console.log("courseId", courseId, questions);
          questions = questions.filter((question) => {
            if (question.courseId === courseId) {
              return question;
            }
          });
        }

        if (searchString) {
          questions = questions.filter((question) => {
            if (question.questionDescription.includes(searchString)) {
              return question;
            }
          });
        }

        // filter out DECLINED and COMPLETED questions

        if (filter === FILTER_OPTIONS_ADMIN.COMPLETED) {
          questions = questions.filter((question) => {
            if (question.status === "COMPLETED") {
              return question;
            }
          });
        }

        if (filter === FILTER_OPTIONS_ADMIN.DECLINED) {
          questions = questions.filter((question) => {
            if (question.status === "DECLINED") {
              return question;
            }
          });
        }

        if (filter === FILTER_OPTIONS_ADMIN.LOCKED) {
          const currentTime = new Date();
          query.userId = undefined;
          const totalRecords = await Question.countDocuments({
            ...query,
            status: { $nin: ["DECLINED", "COMPLETED"] },
            "locked.lockedAt": { $gte: new Date(currentTime - LOCK_DURATION) },
          });

          // Query to get questions with a valid lock within the last 10 minutes
          const questions = await Question.find({
            ...query,
            status: { $nin: ["DECLINED", "COMPLETED"] },
            "locked.lockedAt": { $gte: new Date(currentTime - LOCK_DURATION) },
            "locked.userId": mentorId,
          })
            .populate("studentId", "name")
            .populate("subjectId", "name")
            .populate("statusUpdatedBy", "firstName lastName adminId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

          return {
            questions: questions,
            totalRecords: totalRecords,
          };
        }

        questions = questions.filter((question) => {
          if (
            question.status !== "DECLINED" &&
            question.status !== "COMPLETED"
          ) {
            return question;
          }
        });

        questions.sort((a, b) => {
          return b.createdAt - a.createdAt;
        });
        return {
          questions: questions.slice(skip, skip + limit),
          totalRecords: questions.length,
        };
      }

      if (filter === FILTER_OPTIONS_ADMIN.MY_REPLIED) {
        query.userId = mentorId;
        // const totalRecords = await Comment.countDocuments({ userId: mentorId });
        const comments = await Comment.find({
          userId: mentorId,
        }).populate({
          path: "questionId",
          populate: [
            { path: "studentId", select: "name" },
            { path: "subjectId", select: "name" },
            { path: "statusUpdatedBy", select: "firstname lastname adminId" },
          ],
        });

        let questions = comments.map((comment) => comment.questionId);

        if (chapterId) {
          questions = questions.filter((question) => {
            if (
              question.chapterId &&
              chapterId === question.chapterId.toString()
            ) {
              return question;
            }
          });
        } else {
          if (userType === "Mentor") {
            questions = questions.filter((question) => {
              if (
                question.chapterId &&
                chapterIds.includes(question.chapterId.toString())
              ) {
                return question;
              }
            });
          }
        }

        if (subjectId) {
          questions = questions.filter((question) => {
            if (question.subjectId.toString() === subjectId) {
              return question;
            }
          });
        }

        if (courseId) {
          questions = questions.filter((question) => {
            if (question.courseId === courseId) {
              return question;
            }
          });
        }

        if (searchString) {
          questions = questions.filter((question) => {
            if (question.questionDescription.includes(searchString)) {
              return question;
            }
          });
        }

        // filter out DECLINED and COMPLETED questions
        questions = questions.filter((question) => {
          if (
            question.status !== "DECLINED" &&
            question.status !== "COMPLETED"
          ) {
            return question;
          }
        });

        questions.sort((a, b) => {
          return b.createdAt - a.createdAt;
        });
        return {
          questions: questions.slice(skip, skip + limit),
          totalRecords: questions.length,
        };
      }

      if (filter === FILTER_OPTIONS_ADMIN.FORWARDED) {
        const questions = await Question.find({
          ...query,
          "forwarded.userId": { $exists: true },
          "forwarded.forwardedAt": { $exists: true },
        })
          .populate("studentId", "name")
          .skip(skip)
          .limit(limit);

        questions.sort((a, b) => {
          return b.createdAt - a.createdAt;
        });
        return {
          questions: questions,
          totalRecords: questions.length,
        };
      }

      if (filter === FILTER_OPTIONS_ADMIN.LOCKED) {
        const currentTime = new Date();

        const totalRecords = await Question.countDocuments({
          ...query,
          status: { $nin: ["DECLINED", "COMPLETED"] },
          "locked.lockedAt": { $gte: new Date(currentTime - LOCK_DURATION) },
        });

        // Query to get questions with a valid lock within the last 10 minutes
        const questions = await Question.find({
          ...query,
          status: { $nin: ["DECLINED", "COMPLETED"] },
          "locked.lockedAt": { $gte: new Date(currentTime - LOCK_DURATION) },
        })
          .populate("studentId", "name")
          .populate("subjectId", "name")
          .populate("statusUpdatedBy", "firstName lastName adminId")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);

        return {
          questions: questions,
          totalRecords: totalRecords,
        };
      }

      if (filter === FILTER_OPTIONS_ADMIN.COMPLETED) {
        query.status = "COMPLETED";
        const totalRecords = await Question.countDocuments(query);
        const questions = await Question.find(query)
          .populate("studentId", "name")
          .populate("subjectId", "name")
          .populate("statusUpdatedBy", "firstName lastName adminId")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);

        // only those questions which are answered by mentor

        if (!roles.includes("admin")) {
          const questionsFiltered = [];
          for (let i = 0; i < questions.length; i++) {
            const comment = await Comment.findOne({
              questionId: questions[i]._id,
              userType: "Admin",
              userId: mentorId,
            });
            if (comment) {
              console.log("comment", comment);
              questionsFiltered.push(questions[i]);
            }
          }

          console.log("questionsFiltered", questionsFiltered);

          return {
            questions: questionsFiltered,
            totalRecords: questionsFiltered.length,
          };
        }

        return {
          questions: questions,
          totalRecords: totalRecords,
        };
      }
      if (filter === FILTER_OPTIONS_ADMIN.DECLINED) {
        query.status = "DECLINED";
        const totalRecords = await Question.countDocuments({
          ...query,
        });
        const questions = await Question.find(query)
          .populate("studentId", "name")
          .populate("subjectId", "name")
          .populate("statusUpdatedBy", "firstName lastName adminId")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);

        return {
          questions: questions,
          totalRecords: totalRecords,
        };
      }
      if (filter === FILTER_OPTIONS_ADMIN.NOT_ANSWERED) {
        // const questions = await findQuestionsWithComments(
        //   subjectIds,
        //   isAdmin,
        //   query
        // );
        // question answers greater than 0
        query.answers = 0;
        const totalRecords = await Question.countDocuments({
          ...query,
          status: { $nin: ["DECLINED", "COMPLETED"] },
        });

        const questions = await Question.find({
          ...query,
          status: { $nin: ["DECLINED", "COMPLETED"] },
        })
          .populate("studentId", "name")
          .skip(skip)
          .populate("subjectId", "name")
          .populate("statusUpdatedBy", "firstName lastName adminId")
          .sort({ createdAt: -1 })
          .limit(limit);
        console.log("questions", questions);
        // questions.sort((a, b) => {
        //   return b.createdAt - a.createdAt;
        // });
        return {
          questions: questions,
          totalRecords: totalRecords,
        };
      }

      // console.log("query", query);
      // if (userType === "Admin" && mentorId) {
      //   // find all questions answered by mentor and not completed or declined
      //   query.userId = mentorId;
      //   // query.status = { $nin: ["COMPLETED", "DECLINED"] };
      //   // const totalRecords = await Comment.countDocuments({ userId: mentorId });
      //   // const comments = await Comment.find({
      //   //   userId: mentorId,
      //   // }).populate({
      // }

      console.log("query", query);

      const totalRecords = await Question.countDocuments({
        ...query,
        status: { $nin: ["DECLINED", "COMPLETED"] },
      });

      questions = await Question.find({
        ...query,
        status: { $nin: ["DECLINED", "COMPLETED"] },
      })
        .populate("studentId", "name")
        .populate("subjectId", "name")
        .populate("statusUpdatedBy", "firstName lastName adminId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return {
        questions: questions,
        totalRecords: totalRecords,
      };
    } catch (error) {
      console.error("Error fetching questions by mentor subjects:", error);
      throw error;
    }
  },
  getQuestion: async (id, userId, userType) => {
    let isLiked = false;
    let isBookmarked = false;
    const question = await Question.findOne({ _id: id })
      .populate("studentId", "name")
      .populate("statusUpdatedBy", "firstName lastName adminId");

    // Check if the question is locked
    const lock = await QuestionLock.findOne({ questionId: id });
    let isLocked = false;
    if (question && question.locked && lockValid(question.locked.lockedAt)) {
      isLocked = true;
    }

    const getLikes = await QuestionLike.findOne({ userId, userType });
    const getBookmarks = await StudentBookmarkQuestion.findOne({
      studentId: userId,
    });
    console.log("getLikes", getLikes);
    if (getLikes) {
      isLiked = getLikes.questions.includes(id.toString()); // Convert `id` to string for comparison
    }
    if (getBookmarks) {
      isBookmarked = getBookmarks.questions.includes(id.toString());
    }

    return {
      ...question.toObject(),
      isLiked,
      isBookmarked,
      isLocked,
      lockedBy: lock ? lock.userId : null,
    };
  },

  getStudentsQuestionStatistics: async ({ startDate, endDate }) => {
    console.log("getStudentsQuestionStatistics", startDate, endDate);

    const result = await Question.aggregate([
      // Filter questions within the time range
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      // Lookup to join Student data for branch details
      {
        $lookup: {
          from: "students", // Collection name for Student
          localField: "studentId",
          foreignField: "_id",
          as: "studentDetails",
        },
      },
      // Unwind the studentDetails array to access branch
      { $unwind: "$studentDetails" },
      // Group by branch and count questions
      {
        $group: {
          _id: "$studentDetails.branch", // Group by branch
          questionCount: { $sum: 1 }, // Count the number of questions
        },
      },
      // Lookup to join Branch data for branch name
      {
        $lookup: {
          from: "branches", // Collection name for Branch
          localField: "_id",
          foreignField: "_id",
          as: "branchDetails",
        },
      },
      // Unwind branchDetails to access the branch name
      { $unwind: "$branchDetails" },
      // Project the output
      {
        $project: {
          branchId: "$_id", // Rename `_id` to `branchId`
          branchName: "$branchDetails.name", // Include the branch name
          questionCount: 1, // Include the question count
          _id: 0, // Exclude the default `_id`
        },
      },
    ]);

    const branch = await Branch.find({
      $or: [{ isDeleted: null }, { isDeleted: false }],
    });

    // Add branches with 0 questions

    branch.forEach((branch) => {
      const found = result.find((item) => item.branchId.equals(branch._id));
      if (!found) {
        result.push({
          branchId: branch._id,
          branchName: branch.name,
          questionCount: 0,
        });
      }
    });

    console.log(result);
    //sort by branch name in ascending order
    result.sort((a, b) => {
      return a.branchName.localeCompare(b.branchName);
    });

    return result;
  },

  getByBranch: async ({ startDate, endDate, branchId }) => {
    const result = await Question.aggregate([
      // Filter questions within the time range
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate), // Replace startDate with your start date
            $lte: new Date(endDate), // Replace endDate with your end date
          },
        },
      },
      // Lookup to join Student data for branch details
      {
        $lookup: {
          from: "students", // Collection name for Student
          localField: "studentId",
          foreignField: "_id",
          as: "studentDetails",
        },
      },
      // Unwind the studentDetails array to access branch
      { $unwind: "$studentDetails" },
      // Match the branchId
      {
        $match: {
          "studentDetails.branch": mongoose.Types.ObjectId(branchId),
        },
      },
      // Lookup to join Course data
      {
        $lookup: {
          from: "courses", // Collection name for Course
          localField: "courseId",
          foreignField: "_id",
          as: "courseDetails",
        },
      },
      // Lookup to join Subject data
      {
        $lookup: {
          from: "subjects", // Collection name for Subject
          localField: "subjectId",
          foreignField: "_id",
          as: "subjectDetails",
        },
      },
      // Lookup to join Chapter data
      {
        $lookup: {
          from: "chapters", // Collection name for Chapter
          localField: "chapterId",
          foreignField: "_id",
          as: "chapterDetails",
        },
      },
      // Project the required fields
      {
        $project: {
          questionId: "$_id",
          // studentId: "$studentId",
          // branchId: "$studentDetails.branch",
          course: { $arrayElemAt: ["$courseDetails.name", 0] }, // Assuming courseDetails has `name`
          subject: { $arrayElemAt: ["$subjectDetails.name", 0] }, // Assuming subjectDetails has `name`
          chapter: { $arrayElemAt: ["$chapterDetails.name", 0] }, // Assuming chapterDetails has `name`
          chapterId: 1,
          courseId: 1,
          subjectId: 1,
          answers: 1,
          status: 1, // Include status
          // questionDescription: 1,
          // createdAt: 1,
        },
      },
    ]);

    console.log(result);

    return result;
  },

  deleteQuestion: async (id) => {
    const question = await Question.findOneAndDelete({ _id: id });
    //delete all comments
    await Comment.deleteMany({ questionId: id });
    // delete StudentBookmarkQuestion
    return question;
  },

  updateStatus: async ({ questionId, status, userId, roles }) => {
    console.log("updateStatus", questionId, status, userId, roles);
    let question = await Question.findOne({ _id: questionId });
    // const date = new Date();
    // date.setMinutes(date.getMinutes() - 10);
    const locked = null;
    const statusUpdatedBy = userId;
    // if (
    //   !roles.includes("admin") &&
    //   question.locked &&
    //   lockValid(question.locked.lockedAt)
    // ) {
    //   throw new Error("Question is locked");
    // }
    if (question) {
      if (question.status === "DECLINED" || question.status === "COMPLETED") {
        if (roles.includes("admin")) {
          question = await Question.findOneAndUpdate(
            { _id: questionId },
            { $set: { status, locked, statusUpdatedBy } },
            { new: true }
          )
            .populate("studentId", "name")
            .populate("statusUpdatedBy", "firstName lastName adminId");
          return question;
        } else {
          throw new Error("Not authorized to update status");
        }
      }

      question = await Question.findOneAndUpdate(
        { _id: questionId },
        { $set: { status, locked, statusUpdatedBy } },
        { new: true }
      )
        .populate("studentId", "name")
        .populate("statusUpdatedBy", "firstName lastName adminId");
      return question;
    }
  },

  getAnalytics: async () => {
    const result = await Question.aggregate([
      {
        $lookup: {
          from: "subjects", // Name of the Subject collection (typically pluralized)
          localField: "subjectId",
          foreignField: "_id",
          as: "subject",
        },
      },
      {
        $unwind: "$subject",
      },
      {
        $group: {
          _id: "$subject.name", // Group by subject name
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          value: "$count",
        },
      },
    ]);

    return result;
  },

  setPushToken: async ({ userId, token, userType }) => {
    const pushToken = await new PushToken({
      userId,
      userType,
      token,
    }).save();
    return pushToken;
  },

  getPushToken: async (studentId) => {
    const pushToken = await PushToken.findOne({
      studentId,
    });
    return pushToken;
  },

  getAnswerStatictics: async () => {
    const result = await Question.find();
    const totalDeclined = result.filter(
      (question) => question.status === "DECLINED"
    ).length;
    const totalAnswered = result.filter(
      (question) => question.answers > 0
    ).length;
    const notAnswered = result.filter(
      (question) => question.answers === 0
    ).length;

    return [
      {
        type: "Decline",
        value: totalDeclined,
      },
      {
        type: "Answer",
        value: totalAnswered,
      },
      {
        type: "Not Answer",
        value: notAnswered,
      },
    ];
  },

  getGroupSubjectByStudent: async (studentId) => {
    const student = await Student.findById(studentId).select("groups");
    console.log("getGroupSubjectByStudent groups", student.groups);
    const groupSubjects = await GroupSubject.find({
      groupId: { $in: student.groups },
    });

    console.log("groupSubjects", groupSubjects);

    const subjects = groupSubjects.reduce((acc, groupSubject) => {
      acc.push(...groupSubject.subjects);
      return acc;
    }, []);

    return subjects;
  },
  // search quesy by search string and also by courseId, subjectId, chapterId if provided
  searchQuestions: async ({
    courseId,
    subjectId,
    chapterId,
    searchString,
    filter,
    studentId,
    page = 1,
    limit = 40,
    isMobile = false,
  }) => {
    // The current page number

    //only grtou
    const student = await Student.findById(studentId).select("groups");
    console.log("searchQuestions groups", student.groups);
    const groupSubjects = await GroupSubject.find({
      groupId: { $in: student.groups },
    });

    console.log("searchQuestions groupSubjects", groupSubjects);

    let subjects = groupSubjects.reduce((acc, groupSubject) => {
      acc.push(...groupSubject.subjects);
      return acc;
    }, []);
    subjects = subjects.map((s) => s.toString());

    console.log("searchQuestions subjects", subjects);

    // Calculate how many documents to skip
    //convert limit and page to numbers from strings
    limit = parseInt(limit);
    page = parseInt(page);

    const skip = (page - 1) * limit;
    console.log("searchQuestions");
    console.log("searchString", searchString);
    console.log("courseId", courseId);
    console.log("subjectId", subjectId);
    console.log("chapterId", chapterId);
    console.log("studentId", studentId);

    const query = {};
    if (searchString) {
      query.$or = [
        { questionDescription: { $regex: searchString, $options: "i" } },
      ];
    }
    if (courseId) {
      query.courseId = courseId;
    }
    if (subjectId) {
      query.subjectId = subjectId;
    } else {
      query.subjectId = { $in: subjects };
    }
    if (chapterId) {
      query.chapterId = chapterId;
    }
    if (filter === FILTER_OPTIONS.MY_QUESTIONS) {
      query.studentId = studentId;
    }

    // const totalRecords = await Question.countDocuments(query);
    // let questions = await Question.find(query).populate("studentId", "name");

    // questions = questions.filter((question) => {
    //   //filter out DECLINED questions
    //   if (question.status !== "DECLINED") {
    //     return question;
    //   }
    // });

    // questions = questions.filter((question) => {
    //   if (subjects.includes(question.subjectId.toString())) {
    //     return question;
    //   }
    // });

    // questions = questions.filter((question) => {
    //   console.log("question", question.studentId?._id, studentId);
    //   if (
    //     question.studentId?._id.toString() === studentId ||
    //     (question.studentId?._id.toString() !== studentId &&
    //       question.answers > 0)
    //   ) {
    //     return question;
    //   }
    // });

    // questions.sort((a, b) => {
    //   return b.createdAt - a.createdAt;
    // });

    if (filter === FILTER_OPTIONS.MY_BOOKMARKS) {
      const bookmark = await StudentBookmarkQuestion.findOne({ studentId });
      console.log("bookmark", bookmark);
      if (bookmark) {
        //filter only bookmarked questions
        // try {
        //   questions = questions.filter((question) =>
        //     bookmark.questions.includes(question._id)
        //   );
        //   console.log("questions", questions);
        // } catch (e) {
        //   console.log("error", e);
        // }
        const questions = await Question.find(query)
          .populate("studentId", "name")
          .where("status")
          .ne("DECLINED")
          .or([
            { "studentId._id": studentId }, // studentId matches the provided studentId
            { "studentId._id": { $ne: studentId }, answers: { $gt: 0 } }, // studentId doesn't match and answers > 0
          ])
          .where("_id")
          .in(bookmark.questions)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);

        const totalRecords = await Question.countDocuments(query)
          .where("status")
          .ne("DECLINED")
          .or([
            { "studentId._id": studentId }, // studentId matches the provided studentId
            { "studentId._id": { $ne: studentId }, answers: { $gt: 0 } }, // studentId doesn't match and answers > 0
          ])
          .where("_id")
          .in(bookmark.questions);
        return {
          questions,
          totalRecords,
        };
      }
    }

    if (filter === FILTER_OPTIONS.POPULARITY) {
      const questions = await Question.find(query)
        .populate("studentId", "name")
        .where("status")
        .ne("DECLINED")
        .or([
          { "studentId._id": studentId }, // studentId matches the provided studentId
          { "studentId._id": { $ne: studentId }, answers: { $gt: 0 } }, // studentId doesn't match and answers > 0
        ])
        .sort({ popularity: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalRecords = await Question.countDocuments(query)
        .where("status")
        .ne("DECLINED")
        .or([
          { "studentId._id": studentId }, // studentId matches the provided studentId
          { "studentId._id": { $ne: studentId }, answers: { $gt: 0 } }, // studentId doesn't match and answers > 0
        ]);

      return {
        questions,
        totalRecords,
      };
    }

    const totalRecords = await Question.countDocuments(query)
      .where("status")
      .ne("DECLINED")
      .or([
        { "studentId._id": studentId }, // studentId matches the provided studentId
        { "studentId._id": { $ne: studentId }, answers: { $gt: 0 } }, // studentId doesn't match and answers > 0
      ]);

    let questions = await Question.find(query)
      .populate("studentId", "name")
      .where("status")
      .ne("DECLINED")
      .or([
        { "studentId._id": studentId }, // studentId matches the provided studentId
        { "studentId._id": { $ne: studentId }, answers: { $gt: 0 } }, // studentId doesn't match and answers > 0
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    console.log("searchQuestions questions", questions, totalRecords);

    if (isMobile) {
      return questions;
    }

    return {
      questions,
      totalRecords,
    };
  },

  getQuestionKeyWord: async (searchString, userType, userId, isAdmin) => {
    console.log("getQuestionKeyWord");
    console.log("searchString", searchString);
    console.log("userType", userType);
    console.log("userId", userId);

    if (userType === "Student") {
      const query = {};
      let student = await Student.findById({ _id: userId }).populate("courses");

      const courseIds = student.courses.map((course) => course._id);
      console.log("courseIds", courseIds);
      query.courseId = { $in: courseIds };
      if (searchString) {
        query.$or = [
          { questionDescription: { $regex: searchString, $options: "i" } },
        ];
      }

      student = await Student.findById(userId).select("groups");
      console.log("searchQuestions groups", student.groups);
      const groupSubjects = await GroupSubject.find({
        groupId: { $in: student.groups },
      });

      console.log("searchQuestions groupSubjects", groupSubjects);

      let subjects = groupSubjects.reduce((acc, groupSubject) => {
        acc.push(...groupSubject.subjects);
        return acc;
      }, []);

      subjects = subjects.map((s) => s.toString());

      console.log("subjects", subjects);

      let questions = await Question.find(query).populate("studentId", "name");

      questions = questions.filter((question) => {
        if (subjects.includes(question.subjectId.toString())) {
          return question;
        }
      });

      questions.sort((a, b) => {
        return b.createdAt - a.createdAt;
      });

      questions = questions.filter((question) => {
        //filter out DECLINED questions
        if (question.status !== "DECLINED") {
          return question;
        }
      });

      return questions;
    } //(userType === "Admin")
    else {
      const query = {};
      let subjectIds = [];
      if (isAdmin) {
        const subjects = await Subject.find({}).select("_id");
        subjectIds = subjects.map((subject) => subject._id);
      } else {
        const subjects = await MentorSubject.findOne({
          mentorId: userId,
        }).populate("subjects");
        subjectIds = subjects.subjects.map((subject) => subject._id);
      }

      query.subjectId = { $in: subjectIds };
      if (searchString) {
        query.$or = [
          { questionDescription: { $regex: searchString, $options: "i" } },
        ];
      }
      let questions = await Question.find(query).populate("studentId", "name");
      return questions;
    }
  },

  createAnswer: async ({ questionId, mentorId, answer, media }) => {
    const ans = await new Answer({
      questionId,
      mentorId,
      answer,
      media,
    }).save();
    return ans;
  },

  bookmarkQuestion: async ({ studentId, questionId }) => {
    let bookmark = await StudentBookmarkQuestion.findOne({ studentId });
    if (bookmark) {
      const index = bookmark.questions.indexOf(questionId);
      if (index > -1) {
        bookmark.questions.splice(index, 1);
        decrementBookmark({ questionId });
      } else {
        bookmark.questions.push(questionId);
        incrementBookmark({ questionId });
      }
      await bookmark.save();
    } else {
      incrementBookmark({ questionId });
      bookmark = await new StudentBookmarkQuestion({
        studentId,
        questions: [questionId],
      }).save();
    }

    return bookmark.questions;
  },

  getBookmarkQuestions: async (studentId) => {
    //output only questions
    const bookmark = await StudentBookmarkQuestion.findOne({
      studentId,
    });
    if (!bookmark) {
      return [];
    }
    return bookmark.questions;
  },

  getAnswers: async (questionId) => {
    const answers = await Answer.find({ questionId });
    return answers;
  },
  getAnswer: async (id) => {
    const answer = await Answer.findOne({ _id: id });
    return answer;
  },
  deleteAnswer: async (id) => {
    const answer = await Answer.findOneAndDelete({ _id: id });
    return answer;
  },
  likeQuestion: async ({ userId, userType, questionId }) => {
    try {
      const likes = await QuestionLike.findOne({ userId, userType });
      let isLiked = false;

      if (likes) {
        const index = likes.questions.indexOf(questionId);
        if (index > -1) {
          likes.questions.splice(index, 1);
          // decrementLike({ questionId });

          await Question.findOneAndUpdate(
            { _id: questionId },
            { $inc: { likes: -1 } },
            { new: true }
          );
          isLiked = false;
        } else {
          likes.questions.push(questionId);
          // incrementLike({ questionId });

          await Question.findOneAndUpdate(
            { _id: questionId },
            { $inc: { likes: 1 } },
            { new: true }
          );
          isLiked = true;
        }
        await likes.save();
      } else {
        await new QuestionLike({
          userId,
          userType,
          questions: [questionId],
        }).save();

        await Question.findOneAndUpdate(
          { _id: questionId },
          { $inc: { likes: 1 } },
          { new: true }
        );
        isLiked = true;
      }

      return {
        isLiked,
      };
    } catch (e) {
      console.log(e);
    }
  },

  getLikes: async ({ userId, userType }) => {
    const likes = await QuestionLike.findOne({ userId, userType });

    if (!likes) {
      return [];
    }

    return likes.questions;
  },

  upvoteAnswer: async ({
    userId,
    commentId,
    questionId,
    userType,
    isMobile = false,
  }) => {
    console.log("upvoteAnswer");
    console.log("userId", userId);
    console.log("commentId", commentId);
    console.log("userType", userType);

    let upvote = await UpvoteAnswer.findOne({ userId, userType });
    console.log("upvote", upvote);
    let comment = {};
    if (upvote) {
      const index = upvote.comments.indexOf(commentId);
      if (index > -1) {
        upvote.comments.splice(index, 1);
        comment = await decrementUpvote({ commentId, questionId });
      } else {
        upvote.comments.push(commentId);
        comment = await incrementUpvote({ commentId, questionId });
      }
      await upvote.save();
    } else {
      upvote = await new UpvoteAnswer({
        userId,
        userType,
        comments: [commentId],
      }).save();
      comment = await incrementUpvote({ commentId, questionId });
    }

    if (isMobile) {
      return {
        comments: upvote.comments,
      };
    }

    return {
      updatedComment: {
        upvotes: comment.upvotes,
        _id: comment._id,
      },
      comments: upvote.comments,
    };
  },

  getUpvotes: async ({ userId, userType }) => {
    console.log("getUpvotes");
    console.log("userId", userId);
    console.log("userType", userType);
    const upvote = await UpvoteAnswer.findOne({ userId, userType });
    return upvote.comments;
  },
  // Comment

  createComment: async ({ questionId, userId, userType, reply, media }) => {
    console.log("createComment");
    console.log("answerId", questionId);
    console.log("userId", userId);
    console.log("userType", userType);
    console.log("reply", reply);
    console.log("media", media);

    //check if the user created this question and whether there is an answer by the admin
    const query = {
      _id: questionId,
    };
    if (userType === "Student") {
      query.studentId = userId;
    }
    let question = await Question.findOne(query);

    if (!question) {
      throw new Error("Question not found");
    }
    if (question.status === "DECLINED" || question.status === "COMPLETED") {
      throw new Error("You can't comment on this question");
    }

    if (question && userType === "Student" && question.answers === 0) {
      throw new Error("You can't comment on this question");
    }

    if (!question && userType === "Student") {
      throw new Error("You can't comment on this question");
    }

    const comment = await Comment.findOne({
      questionId,
      userType: "Admin",
    });

    console.log("createComment comment", comment);

    if (!comment && userType === "Student") {
      console.log("createComment comment", comment);
      throw new Error("You can't comment on this question");
    }

    // check if the question is locked by the mentor or not

    let ans = null;

    console.log(
      "question.locked",
      question.locked,
      lockValid(question.locked.lockedAt),
      question.locked.userId,
      userId,
      userType
    );

    if (
      userType === "Admin" &&
      question.locked &&
      question.locked.userId &&
      question.locked.userId.toString() === userId &&
      lockValid(question.locked.lockedAt)
    ) {
      ans = await new Comment({
        questionId,
        userId,
        userType,
        reply,
        media,
      }).save();
    } else if (userType === "Student") {
      ans = await new Comment({
        questionId,
        userId,
        userType,
        reply,
        media,
      }).save();
    } else {
      throw new Error("Please lock the question first to comment!");
    }

    if (userType === "Admin") {
      if (question.status !== "DECLINED") {
        const locked = null;
        const lockable = false;
        const question = await Question.findOneAndUpdate(
          { _id: questionId },
          {
            $set: { status: "COMPLETE", locked, lockable },
            $inc: { answers: 1 },
          },
          { new: true }
        );

        console.log("createComment question", question);
        qaNotification.commentOfQuestionNotification(question);
      }
    } else {
      // loackable true
      const lockable = true;

      const q = await Question.findOneAndUpdate(
        { _id: questionId },
        {
          $set: { lockable },
        },
        { new: true }
      );

      console.log("createComment question", q);
    }

    console.log("ans", ans);

    return ans;
  },
  updateComment: async ({
    commentId,
    reply,
    media,
    userId,
    roles,
    userType,
  }) => {
    let comment = await Comment.findOne({ _id: commentId });

    // only admin and senior mentor can update any comment, mentor can update only his comment
    if (roles.includes("admin") || roles.includes("seniorMentor")) {
      // add in EditHistory

      await new EditHistory({
        commentId: comment._id,
        reply: comment.reply,
        media: comment.media,
        createdAt: comment.createdAt,
      }).save();

      comment = await Comment.findOneAndUpdate(
        { _id: commentId },
        { $set: { reply, media }, $inc: { editCount: 1 } },
        { new: true }
      ).populate("userId", "firstName lastName name");

      return comment;
    }

    console.log("comment", comment.userId, userId, roles);
    if (roles.includes("mentor")) {
      if (comment.userId.toString() === userId.toString()) {
        await new EditHistory({
          commentId: comment._id,
          reply: comment.reply,
          media: comment.media,
          createdAt: comment.createdAt,
        }).save();

        // increment editCount
        comment = await Comment.findOneAndUpdate(
          { _id: commentId },
          { $set: { reply, media }, $inc: { editCount: 1 } },
          { new: true }
        ).populate("userId", "firstName lastName name");

        return comment;
      } else {
        console.log("You can't update this comment!");
        throw new Error("You can't update this comment!");
      }
    }

    if (roles.includes("student")) {
      if (comment.userId.toString() === userId) {
        await new EditHistory({
          commentId: comment._id,
          reply: comment.reply,
          media: comment.media,
          createdAt: comment.createdAt,
        }).save();

        comment = await Comment.findOneAndUpdate(
          { _id: commentId },
          { $set: { reply, media }, $inc: { editCount: 1 } },
          { new: true }
        );

        return comment;
      } else {
        throw new Error("You can't update this comment!");
      }
    }

    return comment;
  },
  getCommentHistory: async (commentId) => {
    const history = await EditHistory.find({ commentId });
    return history;
  },
  getComments: async (questionId) => {
    // first name lasname of user from Admin/Student
    const comments = await Comment.find({ questionId }).populate({
      path: "userId",
      select: "firstName lastName name adminId",
    });

    return comments;
  },
  getComment: async (id) => {
    const comment = await Comment.findOne({ _id: id })
      .populate("userId", "name")
      .exec();
    return comment;
  },
  deleteComment: async ({ id, userId, roles }) => {
    // user roles include admin, mentor, seniorMentor
    // anyone can delete comment if comment is created by Student
    // only admin and senior mentor can delete any comment, mentor can delete only his comment

    let comment = await Comment.findOne({ _id: id });

    if (comment.userType === "Admin") {
      if (roles.includes("admin") || roles.includes("seniorMentor")) {
        await new EditHistory({
          commentId: comment._id,
          reply: comment.reply,
          media: comment.media,
          createdAt: comment.createdAt,
        }).save();

        comment = await Comment.findOneAndDelete({ _id: id });
        await Question.findOneAndUpdate(
          { _id: comment.questionId },
          { $inc: { answers: -1 } }
        );

        return comment;
      }

      if (roles.includes("mentor")) {
        if (comment.userId.toString() === userId) {
          await new EditHistory({
            commentId: comment._id,
            reply: comment.reply,
            media: comment.media,
            createdAt: comment.createdAt,
          }).save();

          comment = await Comment.findOneAndDelete({ _id: id });
          await Question.findOneAndUpdate(
            { _id: comment.questionId },
            { $inc: { answers: -1 } }
          );
          return comment;
        } else {
          throw new Error("You can't delete this comment!");
        }
      }
    }

    await new EditHistory({
      commentId: comment._id,
      reply: comment.reply,
      media: comment.media,
      createdAt: comment.createdAt,
    }).save();

    comment = await Comment.findOneAndDelete({ _id: id });
    await Question.findOneAndUpdate(
      { _id: comment.questionId },
      { $inc: { answers: -1 } }
    );
    return comment;
  },

  // add subject assigned to mentor

  addSeniorMentorSubjects: async ({ mentorId, subject }) => {
    // check if mentor already assigned to subject and subject is array of subjectId
    //populate subjects with name
    const seniorMentorSubjects = await SeniorMentorSubject.findOneAndUpdate(
      { mentorId },
      { $set: { subjects: subject } },
      { new: true, upsert: true }
    );

    return seniorMentorSubjects;
  },

  // get all mentors assigned to subject

  getSeniorMentorSubjects: async (mentorId, isAdmin) => {
    console.log("mentorId", mentorId);
    // const mentorSubject = await MentorSubject.findOne({ mentorId }).populate(
    //   "subjects",
    //   "name",
    // );
    try {
      if (isAdmin) {
        let subjects = await Subject.find({})
          .select("name chapters courseId") // Select only the necessary fields
          .populate({
            path: "chapters", // Populate chapters (assuming you want chapter details)
            match: { name: { $not: /^(GK|HM|[PBZCE])/ } },
          })
          .populate({
            path: "courseId", // Populate courseId from the Course schema
            select: "name session", // Select only the name field from the Course schema
          });

        // subjects = subjects.filter(
        //   (subject) => subject.courseId.session === "2024"
        // );

        return {
          subjects,
        };
      }
      const seniorMentorSubject = await SeniorMentorSubject.findOne({
        mentorId,
      }).populate({
        path: "subjects",
        select: "name courseId chapters",
        populate: {
          path: "chapters",
          match: { name: { $not: /^(GK|HM|H.M|[PBZCE])/ } },
        },
        populate: {
          path: "courseId", // Populate courseId to get details from Course schema if needed
          select: "name session", // Replace with the actual field from Course schema you want to populate
        },
      });

      if (!seniorMentorSubject) {
        return {
          subjects: [],
        };
      }
      return seniorMentorSubject;
    } catch (e) {
      console.log("error", e);
    }
  },

  addMentorChapter: async ({ mentorId, chapters }) => {
    const mentorChapter = await MentorChapter.findOneAndUpdate(
      { mentorId },
      { $set: { chapters: chapters } },
      { new: true, upsert: true }
    );

    return mentorChapter;
  },

  getMentorChapter: async (mentorId) => {
    const mentorChapter = await MentorChapter.findOne({ mentorId }).populate({
      path: "chapters",
      select: "name subjectId",
      match: { name: { $not: /^(GK|HM|H.M|[PBZCE])/ } },
      populate: {
        path: "subjectId",
        select: "name courseId",
        populate: {
          path: "courseId",
          select: "name session",
        },
      },
    });

    console.log("mentorChapter", mentorChapter);

    if (!mentorChapter) {
      return {
        chapters: [],
      };
    }
    return mentorChapter;
  },

  getOnlySeniorMentorSubjects: async (mentorId) => {
    try {
      const seniorMentorSubjects = await SeniorMentorSubject.findOne({
        mentorId,
      }).populate({
        path: "subjects",
        select: "name courseId chapters", // Select both 'name' and 'courseId'
        populate: {
          path: "courseId", // Populate courseId to get details from Course schema if needed
          select: "name", // Replace with the actual field from Course schema you want to populate
        },
      });

      if (!seniorMentorSubjects) {
        return {
          subjects: [],
        };
      }
      return seniorMentorSubjects;
    } catch (e) {
      console.log("error", e);
    }
  },
  // lockQuestion: async ({ questionId, mentorId }) => {
  //   console.log("lockQuestion", questionId, mentorId);

  //   const existingLock = await QuestionLock.findOne({
  //     userId: mentorId,
  //     lockedAt: { $gte: new Date(Date.now() - LOCK_DURATION) }, // Check if lock is within 10 minutes
  //   });
  //   if (existingLock) {
  //     // calculate the time difference
  //     const now = new Date();
  //     const lockedAt = new Date(existingLock.lockedAt);
  //     const diff = now - lockedAt;
  //     const minutes = Math.floor(diff / 60000);

  //     throw new Error(
  //       `A Question is already locked by you ${minutes} minutes ago!`
  //     );
  //   }
  //   const questionLock = await QuestionLock.findOne({ questionId });

  //   console.log("questionLock", questionLock);
  //   if (questionLock) {
  //     const now = new Date();
  //     const lockedAt = new Date(questionLock.lockedAt);
  //     const diff = now - lockedAt;
  //     const minutes = Math.floor(diff / 60000);
  //     if (minutes < 10) {
  //       throw new Error(`Question is already locked ${minutes} minutes ago!`);
  //     } else {
  //       const questionLocked = await QuestionLock.findOneAndUpdate(
  //         { questionId },
  //         { $set: { userId: mentorId, lockedAt: now } },
  //         { new: true }
  //       );
  //       return questionLocked;
  //     }
  //   } else {
  //     const questionlock = await new QuestionLock({
  //       userId: mentorId,
  //       questionId: questionId,
  //     }).save();

  //     return questionlock;
  //   }
  // },
  lockQuestion: async ({ questionId, mentorId }) => {
    console.log("lockQuestion", questionId, mentorId);
    // try {
    //   await firebaseAdmin.sendNotificationToClient(
    //     "fpStc1dEuOgyl4G-zA4J_u:APA91bFz7S9H-phaDqLWzJ9BuVKm7YaKsLuJItijrmmGDcqUvCCEyrjndpcW1BZ0AaucTVFCTnOaAK2fWyyw_G_coH47v3kElvXkuH_26hzMh6HXnxkbA2E",
    //     "hello",
    //     "test"
    //   );

    //   console.log("notification sent");
    // } catch (e) {
    //   console.log("error sending notification");
    // }

    const existingLock = await Question.findOne({
      "locked.userId": mentorId,
      "locked.lockedAt": { $gte: new Date(Date.now() - LOCK_DURATION) },
    });

    if (existingLock) {
      const lockedAt = new Date(existingLock.locked.lockedAt);
      const minutes = Math.floor((Date.now() - lockedAt) / 60000);
      throw new Error(
        `You already have a locked question from ${minutes} minutes ago!`
      );
    }

    const question = await Question.findOne({ _id: questionId }).populate(
      "studentId",
      "name"
    );

    if (!question) {
      throw new Error("Question not found!");
    }

    if (question.locked && question.locked.userId) {
      const lockedAt = new Date(question.locked.lockedAt);
      const minutes = Math.floor((Date.now() - lockedAt) / 60000);

      if (Date.now() - lockedAt < LOCK_DURATION) {
        throw new Error(`Question is already locked ${minutes} minutes ago!`);
      }
    }

    // Lock the question with the new mentor and current timestamp
    if (question.status === "DECLINED" || question.status === "COMPLETED") {
      throw new Error("You can't lock this question");
    }
    question.locked = {
      userId: mentorId,
      lockedAt: new Date(),
    };

    const updatedQuestion = await question.save();
    return updatedQuestion;
  },

  getLockedQuestionByIds: async (questionIds) => {
    console.log("getLockedQuestionByIds", questionIds);
    const lockedQuestions = await QuestionLock.find({
      questionId: { $in: questionIds },
    });
    return lockedQuestions;
  },

  unlockQuestion: async ({ questionId, userId, roles }) => {
    if (roles.includes("admin") || roles.includes("seniorMentor")) {
      // Find the question and remove the lock field
      const unlockedQuestion = await Question.findOneAndUpdate(
        { _id: questionId },
        { $unset: { locked: "" } }, // Remove the lock field
        { new: true }
      ).populate({
        path: "studentId",
        select: "name",
      });

      if (!unlockedQuestion) {
        throw new Error("Question not found or already unlocked!");
      }

      return unlockedQuestion;
    } else {
      throw new Error("You don't have permission to unlock this question!");
    }
  },

  forwardQuestion: async ({ questionId, userId, roles }) => {
    // Find the question to check if it's already forwarded
    const question = await Question.findOne({ _id: questionId });

    if (question.forwarded && question.forwarded.userId) {
      throw new Error("Question already forwarded!");
    }

    // Update the question's forwarded field with the admin's userId and forwardedAt timestamp
    const forwardQuestion = await Question.findOneAndUpdate(
      { _id: questionId },
      {
        $set: {
          forwarded: {
            userId,
            forwardedAt: new Date(),
          },
        },
      },
      { new: true }
    ).populate("forwarded.userId", "name"); // Populate the forwarded user’s name

    return forwardQuestion;
  },
};
