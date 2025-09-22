/* eslint-disable no-underscore-dangle */
const constants = require("../constants");
const notificationSender = require("./notification");
const dao = require("../data");
const {
  server: { platformName },
} = require("../config");
const queue = require("./sqs");
const utils = require("./utils");
const { publishMessage } = require("./redis/pubSub");
const { getClients } = require("./redis");
const logger = require("./winston");

const { ioSub } = getClients();

const resultPublishNotification = async (
  students,
  title,
  examId,
  examResultId,
  isPracticeExam
) => {
  const { notification } = await dao.notification.create({
    students,
    message: `Result of the exam titled ${title} has been published`,
    type: constants.notification.type.NOTIFICATION,
    info: {
      id: examId,
      examResultId,
      action: constants.notification.action.PUBLISHED,
      on: "exam",
      isPracticeExam,
    },
  });
  notificationSender.notifyUsers(students, notification);
};

const commentOfQuestionNotification = async (student, questionId) => {
  const { notification } = await dao.notification.create({
    students,
    message: `A teacher has commented on your question.`,
    type: constants.notification.type.NOTIFICATION,
    info: {
      id: questionId,
      action: constants.notification.action.COMMENT,
      on: "question",
    },
  });
  notificationSender.notifyUsers(student, notification);
};

const generatePublishSMS = ({
  message,
  ranks,
  highestMark,
  results = [],
  exam,
  sendToGuardian = false,
}) => {
  const messages = [];
  // eslint-disable-next-line no-param-reassign
  message = message || {
    startString: "Dear",
    endString: `- ${platformName} Academy`,
  };
  results.forEach((res) => {
    const {
      marksObtained,
      negativeMarks,
      student: { name, sid, _id, username, contact },
    } = res;
    const text = `${message.startString} ${name}, Roll: ${sid}, Live Exam: ${exam.title}, Mark: ${marksObtained}, Neg: ${negativeMarks}, Position: ${ranks[_id]}, Highest: ${highestMark}. ${message.endString}`;
    messages.push({ text, to: username });
    if (sendToGuardian) messages.push({ text, to: contact });
  });
  return messages;
};
function extractExamName(studentData) {
  // Extract keys from the studentData object
  const keys = Object.keys(studentData);

  // Find the key that doesn't match any of the predefined keys
  const examNameKeys = keys.filter(
    (key) =>
      ![
        "studentName",
        "sid",
        "username",
        "contact",
        "totalMarks",
        "count",
        "sl",
      ].includes(key)
  );

  console.log("examNameKey-->", examNameKeys);
  // Return the exam name
  return examNameKeys;
}

const generatePublishSMSAggregate = ({
  message,
  highestMark,
  results = [],
  sendToGuardian = false,
}) => {
  const messages = [];
  // eslint-disable-next-line no-param-reassign
  message = message || {
    startString: "Dear",
    endString: `- ${platformName} Academy`,
  };
  results.forEach((res) => {
    const { studentName, sid, sl, username, contact, totalMarks } = res;
    const examName = extractExamName(res);
    console.log("examName-->", examName);
    const text = `${
      message.startString
    } ${studentName}, Roll: ${sid}, Live Exam: [${examName.join(
      ","
    )}], Mark: ${totalMarks}, Position: ${sl}, Highest: ${highestMark}. ${
      message.endString
    }`;
    messages.push({ text, to: username });
    if (sendToGuardian === "true") {
      console.log("sending to guardian");
      messages.push({ text, to: contact });
    }
  });
  return messages;
};

const processExam = async (examId, groupId) => {
  try {
    console.log("processExam called");
    const studentId = await dao.examResult.getExamParticipant(examId, groupId);
    console.log("processExam:studentId ", studentId);
    if (!studentId) return "done";
    await queue.createJob({ examId, studentId, groupId });
    return processExam(examId, groupId);
  } catch (err) {
    return Promise.reject(err);
  }
};

const startProcessing = async (examId, groupId) => {
  try {
    const isProccessing = await dao.examResult.isExamProcessing(
      examId,
      groupId
    );
    console.log("Is exam Processing: ", isProccessing);
    if (!isProccessing) {
      await dao.examResult.setExamResultProcess(
        examId,
        groupId,
        constants.resultStatusInRedis.PROCESSING
      );
      await processExam(examId, groupId);
      await dao.examResult.setExamResultProcess(
        examId,
        groupId,
        constants.resultStatusInRedis.PROCESSED
      );
      await dao.examResult.deleteStartedExam(examId, groupId);
      //await dao.group.updateExamMoveToPrctice(groupId, examId);
    }

    return "done";
  } catch (err) {
    console.error(err);
    return Promise.reject(err);
  }
};

const autoSubmitHandle = async () => {
  console.log("autoSubmitHandle called");
  try {
    const exams = await dao.examResult.getFinishedExams();
    if (exams && exams.length) {
      const { examId, groupId } = exams[0];
      publishMessage(constants.channel.START_PROCESS, { examId, groupId });
    }
    // const examsUpdated = await dao.examResult.getExamsToMoveToPractice();
    // console.log("examsUpdated", examsUpdated);
    // if (examsUpdated && examsUpdated.length) {
    //   const examsMovedToPractive = await dao.group.updateExamMoveToPrctice(
    //     examsUpdated
    //   );
    //   console.log("examsMovedToPractive", examsMovedToPractive);
    //   //remove from redis

    //   if (examsMovedToPractive) {
    //     examsUpdated.forEach(async (examId) => {
    //       await dao.examResult.removeExamFromUpdateList(examId);
    //     });
    //   }
    // }
    return "done";
  } catch (err) {
    return Promise.reject(err);
  }
};
const getAnswerDoc = (data = {}, exam) => {
  try {
    const { questionId, extra } = data;
    let { answer } = data;
    const questionData = exam.questions.find((q) => {
      if (q && q.question)
        return q.question._id.toString() === questionId.toString();
      return null;
    });
    if (!questionData) throw new Error(constants.errors.NOT_FOUND);
    const { question, point } = questionData;
    let marks = 0;
    const isMCQ =
      question.type === constants.question.type.MCQ ||
      question.type === constants.question.type.CHECKBOX;
    const isMCA = question.type === constants.question.type.MCA;
    if (isMCQ) {
      answer = Array.isArray(answer) ? answer : [answer];
      const isOK = utils.validateAnswer(question.answer, answer);
      if (isOK) {
        marks = point;
      } else marks = exam.negativeMarkPerQuestion * point * -1;
    }
    if (isMCA) {
      let correct = 0;
      let answered = 0;
      for (let i = 0; i < question.answer.length; i++) {
        const a = question.answer[i];
        const b = answer[i];
        if (a === b) correct++;
        if (b !== "N") answered++;
      }

      const wrong = answered - correct;
      let negativeMarks =
        (wrong * exam.negativeMarkPerQuestion) / question.answer.length;
      const positiveMarks = (correct * point) / question.answer.length;
      marks = (positiveMarks - negativeMarks).toFixed(2);
      negativeMarks = negativeMarks * -1;

      console.log("MCA", {
        correct,
        answered,
        negativeMarkPerQuestion: exam.negativeMarkPerQuestion,
        wrong,
        positiveMarks,
        negativeMarks,
        marks,
      });
      return {
        answer,
        questionId,
        correct,
        answered,
        marks,
        extra,
        negativeMarks,
        questionType: question.type,
      };
    }
    return {
      answer,
      questionId,
      marks,
      extra,
      questionType: question.type,
    };
  } catch (err) {
    throw new Error(err.message);
  }
};
const subscribeChannel = (channel) => {
  ioSub.subscribe(channel, (err) => {
    if (err) {
      logger.error("Failed to subscribe: %s", err.message);
    } else {
      logger.info(`Subscribed channel successfully to: ${channel}`);
    }
  });
  ioSub.on("message", (chnl, message) => {
    console.log("Got message:", chnl, message);
    if (chnl === constants.channel.START_PROCESS) {
      console.log(`Received ${message} from ${chnl}`);
      const { examId, groupId } = utils.doParse(message);
      startProcessing(examId, groupId);
    }
  });
};
module.exports = {
  resultPublishNotification,
  generatePublishSMS,
  generatePublishSMSAggregate,
  getAnswerDoc,
  autoSubmitHandle,
  startProcessing,
  subscribeChannel,
};
