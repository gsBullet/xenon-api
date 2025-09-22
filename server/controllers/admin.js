/* eslint-disable no-underscore-dangle */
const moment = require("moment");
const { createTransport } = require("nodemailer");
const passport = require("passport");
const bcrypt = require("bcrypt");
const dao = require("../data");
const utils = require("../lib/utils");
const helper = require("../lib/helper");
const constants = require("../constants");
const otpLib = require("../lib/otp");
const notificationSender = require("../lib/notification");
const ses = require("../lib/ses/email");
const { template } = require("../templates/loginVerification");
const config = require("../config");
const { getAll } = require("../data/admin");

const { platformName } = config.server;

module.exports = {
  addAdmin: async (req, res) => {
    try {
      const reqData = {
        ...req.body,
        password: await helper.generateHashPassword(req.body.password),
      };
      const createdAdmin = await dao.admin.create(reqData);
      delete createdAdmin.password;
      res.ok(createdAdmin);
    } catch (err) {
      const isDuplicateErr = utils.isDuplicateDocument(err.message);
      if (isDuplicateErr) {
        res.conflict({ title: "Username already exist" });
        return;
      }
      res.serverError(err);
    }
  },
  getOtp: async (req, res) => {
    try {
      const { handle, password, viaEmail } = req.body;
      const admin = await dao.admin.findByEmailOrUsername(handle);
      if (!admin) {
        res.notFound({ title: "Admin not found" });
        return;
      }
      if (!admin.verified) {
        res.unauthorized({ message: "User not verified" });
        return;
      }
      if (admin && admin.status !== constants.admin.status.ACTIVE) {
        res.forbidden({ title: "User not active" });
        return;
      }
      const passwordMatch = await bcrypt.compare(password, admin.password);
      if (!passwordMatch) {
        res.unauthorized({ message: "Password incorrect" });
        return;
      }
      const { fullHash, otp } = otpLib.createNewOTP(admin.username);
      const resp = {
        hash: fullHash,
        handle: admin.username,
      };
      if (!viaEmail) {
        notificationSender.sendSms(
          admin.username,
          `Dear ${platformName} Academy user, your verification code is: ${otp}`
        );
      } else {
        if (!admin.email) {
          res.badRequest({
            title: "Please add an email in your profile first",
          });
          return;
        }
        // ses.sendEmail({
        //   to: admin.email,
        //   html: template({
        //     name: `${admin.firstName} ${admin.lastName}`,
        //     code: otp,
        //   }),
        //   subject: 'Verify login',
        //   from: config.ses.fromEmail,
        // });
        //         SMTP_URL=smtp.mailgun.org
        // SMTP_PORT=587
        // SMTP_USER=postmaster@email.retinalms.com
        // SMTP_PASS=f99a9fe77c720ba20b2ee89690103561-4c205c86-5796aca5
        const transporter = createTransport({
          host: process.env.SMTP_URL,
          port: process.env.SMTP_PORT,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        const mailOptions = {
          from: process.env.SMTP_FROM_EMAIL,
          to: admin.email,
          subject: "Xenon Academy OTP",
          text: `Dear ${platformName} Academy user, your verification code is: ${otp}`, // Plain text for fallback
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <p>Dear ${platformName} Academy user,</p>
              <p>Your verification code is:</p>
              <p style="font-size: 24px; font-weight: bold; color: #007bff;">${otp}</p>
              <p>If you did not request this code, please ignore this email.</p>
            </div>
          `,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent to: " + admin.email);
            console.log("Email sent: " + info.response);
          }
        });
      }

      res.ok(resp);
    } catch (err) {
      res.serverError(err);
    }
  },
  verifyLogin: async (req, res) => {
    console.log("verifyLogin", req.body);
    try {
      passport.authenticate("2faStrategy", async (err, admin) => {
        if (err) {
          switch (err) {
            case constants.errors.NOT_ACTIVE:
              res.forbidden({ title: "User not active" });
              break;
            case constants.errors.NOT_FOUND:
              res.forbidden({ title: "User not exist" });
              break;
            case constants.errors.NOT_VERIFIED:
              res.unauthorized({ message: "User not verified" });
              break;
            default:
              res.serverError(err);
              break;
          }
          return;
        }
        if (!admin) {
          res.unauthorized({ message: "Incorrect OTP or expired" });
          return;
        }
        req.logIn(admin, async (loginErr) => {
          if (loginErr) {
            res.serverError(loginErr);
            return;
          }
          // handling single session
          const sess = await dao.session.getByUsername(admin.username);
          if (sess) {
            await dao.session.deleteByUsername(admin.username, sess.sessionId);
          }
          await dao.session.create({
            ...admin,
            name: `${admin.firstName} ${admin.lastName}`,
            sessionId: req.sessionID,
          });
          res.ok({ loggedIn: true, admin });
        });
      })(req, res);
    } catch (err) {
      res.serverError(err);
    }
  },
  deleteAdmin: async (req, res) => {
    try {
      const admin = await dao.admin.deleteByUsername(req.params.username);
      if (!admin) {
        res.notFound({ title: "Admin not found" });
        return;
      }
      res.ok({ title: "Admin deleted successfully" });
    } catch (err) {
      res.serverError(err);
    }
  },
  updateAdmin: async (req, res) => {
    try {
      const reqData = req.body;
      if (req.body.password) {
        reqData.password = await helper.generateHashPassword(req.body.password);
      }
      const admin = await dao.admin.updateById(req.params.id, req.body);
      if (!admin) {
        res.notFound({ title: "Admin not found" });
      }
      res.ok(admin);
    } catch (err) {
      res.serverError(err);
    }
  },
  register: async (req, res) => {
    try {
      const { id } = req.params;
      const { code } = req.query;
      const admin = await dao.admin.findById(id);
      if (!admin) {
        res.notFound({ title: "You are not invited" });
        return;
      }
      if (admin.verified) {
        res.forbidden({ title: "Already verified" });
        return;
      }
      if (code !== admin.verificationCode) {
        res.forbidden({ title: "Invalid verification code" });
        return;
      }
      const expTime = moment(new Date(admin.codeGeneratedAt)).add(
        30,
        "minutes"
      );
      if (Date.now() > new Date(expTime).valueOf()) {
        res.forbidden({ title: "Verification code timeout" });
        return;
      }
      const reqData = {
        ...req.body,
        password: await helper.generateHashPassword(req.body.password),
      };
      const registeredAdmin = await dao.admin.register(id, reqData);
      res.ok(registeredAdmin);
    } catch (err) {
      res.serverError(err);
    }
  },
  resetPassword: async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const admin = await dao.admin.findByUsername(req.user.username);
      if (!admin) {
        res.notFound({ title: "User not exist" });
        return;
      }
      const isMatched = await helper.compareHashPassword(
        oldPassword,
        admin.password
      );
      if (!isMatched) {
        res.forbidden({ title: "Incorrect password" });
        return;
      }
      const hashedPassword = await helper.generateHashPassword(newPassword);
      const data = await dao.admin.updateById(req.user.id, {
        password: hashedPassword,
      });
      if (!data) {
        throw new Error("Query failed");
      }
      res.ok({ title: "Password reset successful" });
    } catch (err) {
      res.serverError(err);
    }
  },
  login: async (req, res) => {
    try {
      passport.authenticate("adminStrategy", async (err, admin) => {
        if (err) {
          switch (err) {
            case constants.errors.NOT_ACTIVE:
              res.forbidden({ title: "User not active" });
              break;
            case constants.errors.NOT_FOUND:
              res.forbidden({ title: "User not exist" });
              break;
            case constants.errors.NOT_VERIFIED:
              res.unauthorized({ message: "User not verified" });
              break;
            default:
              res.serverError(err);
              break;
          }
          return;
        }
        if (!admin) {
          res.unauthorized({ message: "Password or username incorrect" });
          return;
        }
        req.logIn(admin, async (loginErr) => {
          if (loginErr) {
            res.serverError(loginErr);
            return;
          }
          await dao.session.create({
            ...admin,
            name: `${admin.firstName} ${admin.lastName}`,
            sessionId: req.sessionID,
          });
          res.ok({ loggedIn: true, admin });
        });
      })(req, res);
    } catch (err) {
      res.serverError(err);
    }
  },
  allAdmins: async (req, res) => {
    try {
      const admins = await dao.admin.getAll();
      res.ok(admins);
    } catch (err) {
      res.serverError(err);
    }
  },
  getAllMentors: async (req, res) => {
    try {
      console.log("req.body", req.body);
      const mentors = await dao.admin.getAllMentors(req.body);
      res.ok(mentors);
    } catch (err) {
      res.serverError(err);
    }
  },
  getAllSeniorMentors: async (req, res) => {
    try {
      console.log("req.body", req.body);
      const mentors = await dao.admin.getAllSeniorMentors(req.body);
      res.ok(mentors);
    } catch (err) {
      res.serverError(err);
    }
  },
};
