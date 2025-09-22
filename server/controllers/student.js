/* eslint-disable no-underscore-dangle */
const passport = require("passport");
const constants = require("../constants");
const dao = require("../data");
const utils = require("../lib/utils");
const otpLib = require("../lib/otp");
const helper = require("../lib/helper");
const notificationSender = require("../lib/notification");
const { generateStudentList } = require("../lib/csvGenerator");
const {
  server: { platformName, appLink },
} = require("../config");
const { getCourseByStudent } = require("../data/student");

module.exports = {
  login: async (req, res) => {
    try {
      // console.log("student ", req)
      passport.authenticate("studentStrategy", async (err, student) => {
        if (err) {
          switch (err) {
            case constants.errors.NOT_ACTIVE:
              res.forbidden({ title: "Student is not active" });
              break;
            case constants.errors.PASSWORD_NOT_SET:
              res.forbidden({ title: "Password did not set yet" });
              break;
            case constants.errors.NOT_FOUND:
              res.forbidden({ title: "Student does not exist" });
              break;
            case constants.errors.NOT_VERIFIED:
              res.unauthorized({ message: "Student is not verified" });
              break;
            case constants.errors.INCORRECT_PASSWORD:
              res.unauthorized({ message: "Password or username incorrect" });
              break;
            default:
              res.serverError(err);
              break;
          }
        }
        req.logIn(student, async (loginErr) => {
          if (loginErr) {
            res.serverError(loginErr);
            return;
          }
          // handling single session
          const sess = await dao.session.getByUsername(student.username);
          if (sess) {
            await dao.session.deleteByUsername(
              student.username,
              sess.sessionId
            );
          }
          await dao.session.create({
            ...student,
            sessionId: req.sessionID,
          });
          res.ok({ loggedIn: true, student });
          // eslint-disable-next-line
          return;
        });
      })(req, res);
    } catch (err) {
      res.serverError(err);
    }
  },
  loginBypass: async (req, res) => {
    try {
      const { username } = req.body;
      const student = await dao.student.getByUsername(username);
      if (!student) {
        res.notFound({ title: "Student not found" });
        return;
      }

      const sess = await dao.session.getByUsername(student.username);
      console.log("student", req.sessionID);
      if (sess) {
        await dao.session.deleteByUsername(student.username, sess.sessionId);
      }
      await dao.session.create({
        ...student,
        sessionId: req.sessionID,
      });
      res.ok({ loggedIn: true, student });
    } catch (err) {
      console.log(err);
      res.serverError(err);
    }
  },

  setPassword: async (req, res) => {
    try {
      const { hash, phone, otp, password } = req.body;
      const { forgotPassword } = req.query;
      const { ok, code } = otpLib.verifyOTP(phone, hash, otp);
      if (ok) {
        const hashPassword = await helper.generateHashPassword(password);
        await dao.student.updateByUsername(phone, {
          password: hashPassword,
          isVerified: true,
          status: constants.student.status.ACTIVE,
        });
        if (forgotPassword) {
          res.ok({ title: "Password reset successful" });
          return;
        }
        res.ok({ title: "OTP verification successful" });
      } else if (code === constants.errors.INCORRECT) {
        res.badRequest({ title: "Incorrect OTP" });
      } else if (code === constants.errors.EXPIRED) {
        res.badRequest({ title: "Expired OTP" });
      }
    } catch (err) {
      res.serverError(err);
    }
  },
  updateProfile: async (req, res) => {
    try {
      const student = await dao.student.updateById(req.user.id, req.body);
      res.ok(student);
    } catch (err) {
      res.serverError(err);
    }
  },
  updateProfileById: async (req, res) => {
    try {
      const student = await dao.student.updateById(req.params.id, req.body);
      res.ok(student);
    } catch (err) {
      res.serverError(err);
    }
  },
  profile: async (req, res) => {
    try {
      console.log("student", req.body.user);
      const student = await dao.student.getProfile(req.user.id);
      res.ok(student);
    } catch (err) {
      res.serverError(err);
    }
  },
  getCourseByStudentWithSubjectAndChapter: async (req, res) => {
    try {
      const courses = await dao.student.getCourseByStudentWithSubjectAndChapter(
        req.user.id
      );
      res.ok(courses);
    } catch (err) {
      res.serverError(err);
    }
  },
  getCourseByStudent: async (req, res) => {
    try {
      //get id from params

      const courses = await getCourseByStudent(req.params.id);
      res.ok(courses);
    } catch (err) {
      res.serverError(err);
    }
  },
  alternateExam: async (req, res) => {
    try {
      const { username, code, link } = req.body;
      const student = await dao.student.getByStudentId(username);
      if (!student) {
        res.notFound({ title: "Student not found" });
        return;
      }
      const updatedStudent = await dao.student.addAlternateExamCode(
        String(username).trim(),
        String(code).trim(),
        link
      );
      console.log(updatedStudent);
      res.ok(updatedStudent);
    } catch (err) {
      res.serverError(err);
    }
  },
  getAlternateExam: async (req, res) => {
    try {
      const { username } = req.params;
      const student = await dao.student.getAlternateExam(username);
      if (!student) {
        res.notFound({ title: "Student not found" });
        return;
      }
      res.ok(student);
    } catch (err) {
      res.serverError(err);
    }
  },
  profileFromDB: async (req, res) => {
    try {
      const { userid } = req.query;
      const student = await dao.student.getProfileFromDB(userid);
      res.ok(student);
    } catch (err) {
      res.serverError(err);
    }
  },
  profileById: async (req, res) => {
    try {
      const student = await dao.student.getProfile(req.params.id);
      res.ok(student);
    } catch (err) {
      res.serverError(err);
    }
  },
  getOtp: async (req, res) => {
    const { username } = req.params;
    const { isValid, number } = utils.formatNumber(username);
    if (!isValid) {
      res.badRequest({ title: "Phone number should be valid" });
      return;
    }
    const student = await dao.student.getByUsername(username);
    if (!student) {
      res.notFound({ title: "You are not invited" });
      return;
    }
    switch (student.status) {
      case constants.student.status.ACTIVE:
        res.badRequest({ title: "User account already activated" });
        break;
      case constants.student.status.BANNED:
        res.forbidden({ title: "Your account is banned" });
        break;
      case constants.student.status.DEACTIVE:
        res.forbidden({ title: "Your account is deactivated" });
        break;
      default:
        break;
    }
    if (student.status === constants.student.status.PENDING) {
      const { fullHash: hash, otp } = otpLib.createNewOTP(number);
      notificationSender.sendSms(
        number,
        `Dear ${platformName} Academy user, your verification code is: ${otp}`
      );
      res.ok({ hash, phone: number });
    }
  },
  exportCsv: async (req, res) => {
    try {
      const {
        lastId,
        session,
        branch,
        sid,
        username,
        name,
        courseId,
        startDate,
        endDate,
      } = req.query;
      const students = await dao.student.getStudents({
        lastId,
        session,
        branch,
        sid,
        username,
        name,
        courseId,
        startDate,
        endDate,
        all: true,
      });
      const ret = await generateStudentList(students, courseId, session);
      res.ok(ret);
    } catch (err) {
      console.log(err);
      res.serverError(err);
    }
  },
  exportCsvByGroupId: async (req, res) => {
    try {
      const { groupId } = req.params;
      const students = await dao.student.studentsByGroupId(groupId);
      const ret = await generateStudentList(students);
      res.ok(ret);
    } catch (err) {
      res.serverError(err);
    }
  },
  allStudents: async (req, res) => {
    try {
      const {
        lastId,
        session,
        branch,
        sid,
        username,
        name,
        courseId,
        startDate,
        endDate,
      } = req.query;
      const students = await dao.student.getStudents({
        lastId,
        session,
        branch,
        sid,
        username,
        name,
        courseId,
        startDate,
        endDate,
      });
      res.ok(students);
    } catch (err) {
      res.serverError(err);
    }
  },
  addStudent: async (req, res) => {
    try {
      const { username, courses } = req.body;
      const student = await dao.student.getByUsername(username);
      if (!student) {
        const createdStudent = await dao.student.addStudent(req.body);
        res.ok(createdStudent);
        const sms = `Dear Student, you have been invited to sign up at ${appLink}/register , please use the mobile number ${username.substr(
          2
        )} to register & set the password. - ${platformName} Academy`;
        notificationSender.sendSms(username, sms);
        return;
      }
      const updatedStudent = await dao.student.addCourseForStudent(
        student._id,
        courses
      );
      res.ok(updatedStudent);
    } catch (err) {
      const isDuplicateErr = utils.isDuplicateDocument(err.message);
      if (isDuplicateErr) {
        res.conflict({ title: "Student username or ID already exist" });
        return;
      }
      res.serverError(err);
    }
  },
  addCourse: async (req, res) => {
    try {
      const { id, courses } = req.body;
      const updatedStudent = await dao.student.addCourseForStudent(id, courses);
      res.ok(updatedStudent);
    } catch (err) {
      res.serverError(err);
    }
  },
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const student = await dao.student.updateById(id, req.body);
      if (req.body.status === constants.student.status.DEACTIVE) {
        const session = await dao.session.getByUsername(student.username);
        if (session) {
          await dao.session.deleteByUsername(
            student.username,
            session.sessionId
          );
        }
      }
      res.ok(student);
    } catch (err) {
      res.serverError(err);
    }
  },
  updateStatusMultiple: async (req, res) => {
    try {
      const { students, status } = req.body;
      const ret = await dao.student.updateStatus(students, status);
      res.ok(ret);
    } catch (err) {
      res.serverError(err);
    }
  },
  removeCourse: async (req, res) => {
    try {
      const { id, courses } = req.body;
      const updatedStudent = await dao.student.removeCourseForStudent(
        id,
        courses
      );
      res.ok(updatedStudent);
    } catch (err) {
      res.serverError(err);
    }
  },
  deleteStudents: async (req, res) => {
    try {
      const ret = await dao.student.deleteStudents(req.body.students);
      res.ok(ret);
    } catch (err) {
      res.serverError(err);
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const { username } = req.params;
      const student = await dao.student.getByUsername(username);
      if (!student) {
        res.notFound({ title: "Student not registered" });
        return;
      }
      switch (student.status) {
        case constants.student.status.BANNED:
          res.forbidden({ title: "Your account is banned" });
          break;
        case constants.student.status.DEACTIVE:
          res.forbidden({ title: "Your account is deactivated" });
          break;
        default:
          break;
      }
      const { fullHash: hash, otp } = otpLib.createNewOTP(username);
      notificationSender.sendSms(
        username,
        `Dear ${platformName} Academy user, your verification code is: ${otp}`
      );
      res.ok({ hash, phone: username });
    } catch (err) {
      res.serverError(err);
    }
  },
};
