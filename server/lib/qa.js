const constants = require("../constants");
const notificationSender = require("./notification");
const dao = require("../data");

// const sendEmail = async (email, subject, message) => {
//   const transporter = createTransport({
//     host: process.env.SMTP_URL,
//     port: process.env.SMTP_PORT,
//     secure: false,
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   });
//   const mailOptions = {
//     from: "postmaster@email.retinalms.com",
//     to: email,
//     subject: subject,
//     text: message,
//   };

//   transporter.sendMail(mailOptions, function (error, info) {
//     if (error) {
//       console.log(error);
//     } else {
//       console.log("Email sent to: " + email);
//       console.log("Email sent: " + info.response);
//     }
//   });
// };

const commentOfQuestionNotification = async (question) => {
  console.log("commentOfQuestionNotification", question);
  const { notification } = await dao.notification.create({
    students: [question.studentId],
    message: `A teacher has commented on your question.`,
    type: constants.notification.type.NOTIFICATION,
    info: {
      id: question._id,
      action: constants.notification.action.COMMENT,
      on: "question",
    },
  });

  console.log("notification", notification);
  console.log("question.studentId", question.studentId);
  const student = await dao.student.getById(question.studentId);
  console.log("student", student);
  notificationSender.notifyUsers([student.username], notification);
};

module.exports = {
  commentOfQuestionNotification,
};
