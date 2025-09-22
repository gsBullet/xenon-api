/* eslint-disable no-restricted-syntax */
/* eslint-disable eqeqeq */
/* eslint-disable no-underscore-dangle */
const moment = require("moment");
const constants = require("../constants");
const dao = require("../data");
const utils = require("../lib/utils");
const messageq = require("../lib/redis/messageq");
const notificationSender = require("../lib/notification");
const {
  generatePublishSMS,
  resultPublishNotification,
  getAnswerDoc,
} = require("../lib/exam");
const { generateExam } = require("../lib/csvGenerator");
// const queue = require("../lib/sqs");
const queue = require('../lib/redis/beeQ');
const logger = require("../lib/winston");
const { publishMessage } = require("../lib/redis/pubSub");
const { changeExamType, addSegmentedExamSubject } = require("../data/exam");
const { get } = require("mongoose");

module.exports = {
  create: async (req, res) => {
    try {
      const exam = await dao.exam.create(req.body);
      res.ok(exam);
    } catch (err) {
      res.serverErr(err);
    }
  },

  addSegmentedExamSubject: async (req, res) => {
    try {
      const exam = await dao.exam.addSegmentedExamSubject(req.body);
      res.ok(exam);
    } catch (err) {
      res.serverError(err);
    }
  },

  getSegmentedExamSubject: async (req, res) => {
    try {
      const { examId, studentId } = req.params;
      const exam = await dao.exam.getSegmentedExamSubject(examId, studentId);
      res.ok(exam);
    } catch (err) {
      logger.error(
        `exam-getSegmentedExamSubject: Get segmented exam subject failed for user ${req.user.id} in exam: ${req.params.examId} with error: ${err.stack}`
      );
      res.serverError(err);
    }
  },

  getById: async (req, res) => {
    try {
      const { id, groupId } = req.params;
      const { exams, roles, id: studentId } = req.user;
      const isStudent = roles.includes(constants.student.roles.STUDENT);
      if (isStudent) {
        const startedExam = exams.find((e) => e.exam == id);
        if (!startedExam) {
          res.forbidden({ title: "You did not start this exam yet" });
          return;
        }
      }
      const exam = await dao.exam.getById(id, groupId, {
        isStudent,
        studentId,
      });

      // const examDetails = await dao.group.findExam(groupId, id);
      // console.log('examDetails-->', examDetails);
      res.ok(exam);
    } catch (err) {
      logger.error(
        `exam-getById: Get exam failed for user ${req.user.id} in exam: ${req.params.id} with error: ${err.stack}`
      );
      if (err.message === constants.errors.NOT_FOUND) {
        res.notFound("Exam not found");
        return;
      }
      res.serverError(err);
    }
  },

  removeQuestion: async (req, res) => {
    try {
      const { questionId, id } = req.params;
      const exam = await dao.exam.removeQuestion(id, questionId);
      res.ok(exam);
    } catch (err) {
      res.serverError(err);
    }
  },

  changeExamType: async (req, res) => {
    try {
      const { id } = req.params;
      const exam = await changeExamType(id, true);

      res.ok(exam);
    } catch (err) {
      res.serverError(err);
    }
  },

  addQuestion: async (req, res) => {
    try {
      const { id } = req.params;
      const exam = await dao.exam.addQuestion(id, req.body.questions);
      res.ok(exam);
    } catch (err) {
      logger.error(
        `exam-addQuestion: Add question failed for user ${req.user.id} in exam: ${req.params.id} with error: ${err.stack}`
      );
      res.serverError(err);
    }
  },

  update: async (req, res) => {
    try {
      const exam = await dao.exam.update(req.params.id, req.body);
      res.ok(exam);
    } catch (err) {
      logger.error(
        `exam-update: Update exam failed for user ${req.user.id} in exam: ${req.params.id} with error: ${err.stack}`
      );
      res.serverError(err);
    }
  },

  getAllExamByCourseId: async (req, res) => {
    try {
      const { subjectId, startDate, endDate, lastId } = req.query;
      const opts = { subjectId, startDate, endDate };
      const exams = await dao.exam.getAllExamsByCourseId(
        req.params.courseId,
        lastId,
        opts
      );
      res.ok(exams);
    } catch (err) {
      logger.error(
        `exam-getAllExamByCourseId: Get all exam by course failed for user ${req.user.id} with error: ${err.stack}`
      );
      res.serverError(err);
    }
  },

  getAllExamBySubjectId: async (req, res) => {
    try {
      const { subjectId, startDate, endDate, lastId } = req.query;
      const opts = { subjectId, startDate, endDate };
      const exams = await dao.exam.getAllExamsByCourseId(
        req.params.courseId,
        lastId,
        opts
      );
      res.ok(exams);
    } catch (err) {
      logger.error(
        `exam-getAllExamBySubjectId: Get all exam by subject failed for user ${req.user.id} with error: ${err.stack}`
      );
      res.serverError(err);
    }
  },

  delete: async (req, res) => {
    try {
      const { confirm } = req.query;
      const examId = req.params.id;
      const allGroups = await dao.group.getAllGroupByExamId(examId);
      const groups = [];
      allGroups.forEach((group) => {
        const groupExams = [];
        const examFound = group.exams.find((exam) => {
          const { SCHEDULED, RESULT_PUBLISHED, PUBLISHED, CREATED } =
            constants.exam.status;
          const isPublished = [
            SCHEDULED,
            RESULT_PUBLISHED,
            PUBLISHED,
            CREATED,
          ].includes(exam.status);
          console.log(exam);
          if (exam.examId.toString() === examId.toString()) {
            groupExams.push(exam);
          }
          return isPublished && exam.examId.toString() === examId.toString();
        });
        // eslint-disable-next-line no-param-reassign
        group.exams = groupExams;
        if (examFound) groups.push(group);
      });

      if (groups && groups.length && !confirm) {
        res.conflict({
          title: "Exam exist in groups",
          groups: groups.map((group) => ({
            _id: group._id,
            name: group.name,
            image: group.image,
            exams: group.exams,
          })),
        });
        return;
      }
      if (confirm && groups && groups.length) {
        for await (const group of groups) {
          await dao.group.removeExam(group._id, examId);
        }
      }
      const exam = await dao.exam.delete(examId);
      if (!exam) {
        res.notFound({ title: "Exam not found" });
        return;
      }
      res.ok(exam);
    } catch (err) {
      logger.error(
        `exam-delete: Delete exam failed for user ${req.user.id} in exam: ${req.params.id} with error: ${err.stack}`
      );
      res.serverError(err);
    }
  },

  startExam: async (req, res) => {
    try {
      //throw new Error("Test Error") to check

      // new Error("Test Error");

      const {
        params: { examId, groupId },
        examInThisGroup,
      } = req;
      const { endsAt, startsAt } = examInThisGroup;

      let { ended, started } = utils.timeRangeChecker(endsAt, startsAt);
      console.log("examId-->", examId);
      if (examInThisGroup?.examId?.isPracticeExam) {
        ended = false;
      }
      console.log("ended-->", ended);
      if (ended) {
        logger.error(
          `exam-startExam: 1. Start exam failed for user ${req.user.id} in exam: ${req.params.examId} with error: Exam already finished`
        );
        res.badRequest({ title: "Exam already finished" });
        return;
      }
      if (!started) {
        logger.error(
          `exam-startExam: 2. Start exam failed for user ${req.user.id} in exam: ${req.params.examId} with error: Current time is less than start time`
        );
        res.badRequest({ title: "Current time is less than start time" });
        return;
      }
      const { id: studentId } = req.user;
      const isStarted = await dao.examResult.getByStudentIdAndExamId(
        studentId,
        examId,
        studentId
      );
      if (isStarted) {
        logger.error(
          `exam-startExam: 3. Start exam failed for user ${req.user.id} in exam: ${req.params.examId} with error: You have already started this exam`
        );
        res.ok({ title: "You have already started this exam" });
        return;
      }
      const exam = await dao.exam.getById(examId);
      if (!exam) {
        logger.error(
          `exam-startExam: 4. Start exam failed for user ${req.user.id} in exam: ${req.params.examId} with error: Exam not found`
        );
        res.notFound({ title: "Exam not found" });
        return;
      }
      try {
        const examResult = await dao.examResult.startExam(
          studentId,
          examId,
          groupId
        );
        res.ok(examResult);
      } catch (err) {
        logger.error(
          `exam-startExam: 5. Start exam failed for user ${req.user.id} in exam: ${req.params.examId} with error: ${err.stack}`
        );
        const isDuplicateErr = utils.isDuplicateDocument(err.message);
        if (isDuplicateErr) {
          if (exam.isPracticeExam) {
            const ok = await dao.examResult.retakeExamRedis(
              examId,
              studentId,
              groupId
            );
            logger.info(
              `Retake exam set into redis for exam: ${examId}, student: ${studentId}, group: ${groupId}, status: ${ok}`
            );

            res.ok({ message: "Practice exam started" });
            return;
          }
          res.conflict({ title: "You have already started this exam" });
          return;
        }
      }
    } catch (err) {
      logger.error(
        `exam-startExam: 6. Start exam failed for user ${req.user.id} in exam: ${req.params.examId} with error: ${err.stack}`
      );
      console.log(err);
      if (err.message === constants.errors.NOT_FOUND) {
        res.notFound({ title: "Group not found" });
        return;
      }

      res.serverError(err);
    }
  },

  getExamResultByStudentIdAndExamId: async (req, res) => {
    try {
      const { id: studentId, roles } = req.user;
      const {
        params: { examId, groupId },
        examInThisGroup,
      } = req;
      const exam = await dao.exam.getById(examId, groupId, {
        isStudent: true,
        studentId,
      });
      if (!exam) {
        res.notFound({ title: "Exam not found" });
        return;
      }

      console.log("studentId-->", studentId);
      const isStudent = roles.includes(constants.student.roles.STUDENT);
      const examResult = await dao.examResult.getByStudentIdAndExamId(
        studentId,
        examId,
        groupId
      );
      if (!examResult) {
        console.log("No Submission Found");
        res.notFound({ title: "No submission found" });
        return;
      }
      if (examResult.publishedAt === 0 && isStudent) {
        if (exam.isPracticeExam) {
          const answers = await dao.examResult.getAnswers(
            examId,
            studentId,
            groupId
          );
          if (answers || answers.length) {
            // TODO: have to add groupId in setAnswers
            await dao.examResult.setAnswers(
              answers,
              examId,
              studentId,
              groupId
            );
            await dao.examResult.deleteAnswers(examId, studentId, groupId);
          }
          const publishedResult = await dao.examResult.publishUpdate(
            examId,
            studentId,
            groupId,
            Date.now(),
            0,
            examInThisGroup
          );
          if (!publishedResult) {
            res.notFound({ title: "No submission found" });
            return;
          }
          if (publishedResult) {
            await resultPublishNotification(
              [studentId],
              exam.title,
              examId,
              examResult._id,
              exam.isPracticeExam
            );
            res.ok({ examResult: publishedResult, exam });
            return;
          }
        }
        res.ok({
          code: "notPublishedYet",
          title: "Result not published yet",
        });
        return;
      }
      res.ok({ examResult, exam });
    } catch (err) {
      logger.error(
        `exam-getExamResultByStudentIdAndExamId: Get exam result failed for user ${req.user.id} in exam: ${req.params.examId} with error: ${err.stack}`
      );
      res.serverError(err);
    }
  },

  getExamResultByExamId: async (req, res) => {
    try {
      const { id: examId, groupId } = req.params;
      const { lastId } = req.query;
      const examResult = await dao.examResult.getByExamId(
        examId,
        groupId,
        lastId
      );
      console.log("examResult-->", examResult);
      res.ok(examResult);
    } catch (err) {
      logger.error(
        `exam-getExamResultByExamId: Get exam result failed for user ${req.user.id} in exam: ${req.params.examId} with error: ${err.stack}`
      );
      //console.log(err);
      res.serverError(err);
    }
  },
  exportCSV: async (req, res) => {
    try {
      const { examId } = req.params;
      const exam = await dao.exam.getById(examId, {
        isStudent: false,
        studentId: null,
      });
      const ret = await generateExam(exam);
      res.ok(ret);
    } catch (err) {
      logger.error(
        `exam-exportCSV: Export CSV failed for user ${req.user.id} in exam: ${req.params.examId} with error: ${err.stack}`
      );
      res.serverError(err);
    }
  },

  addAnswer: async (req, res) => {
    const { id: studentId, exams } = req.user;
    const {
      params: { examId, groupId },
      examInThisGroup,
      body: { questionId, answerIndex },
    } = req;

    try {
      const startedExam = exams.find(
        (e) => e.exam && e.exam.toString() == examId.toString()
      );
      if (!startedExam) {
        logger.error(
          `exam-addAnswer: 1. Add answer failed for user ${studentId} in exam: ${examId}, group: ${groupId} with error: You did not start this exam yet`
        );
        res.forbidden({ title: "You did not start this exam yet" });
        return;
      }
      if (startedExam.submittedAt) {
        logger.error(
          `exam-addAnswer: 2. Add answer failed for user ${studentId} in exam: ${examId}, group: ${groupId} with error: You have already submitted exam`
        );
        res.forbidden({ title: "You have already submitted exam" });
        return;
      }
      const exam = await dao.exam.getById(examId);
      if (!exam) {
        logger.error(
          `exam-addAnswer: 3. Add answer failed for user ${studentId} in exam: ${examId}, group: ${groupId} with error: Exam not found`
        );
        res.notFound({ title: "Exam not found" });
        return;
      }
      const { endsAt, startsAt } = examInThisGroup;
      const { ended } = utils.timeRangeChecker(endsAt, startsAt);
      const examResult = await dao.examResult.getByStudentIdAndExamId(
        studentId,
        examId,
        groupId,
        true
      );
      if (!examResult) {
        logger.error(
          `exam-addAnswer: 4. Add answer failed for user ${studentId} in exam: ${examId}, group: ${groupId} with error: No submission found`
        );
        res.notFound({ title: "No submission found" });
        return;
      }
      const endTime = moment(examResult.startsAt).add(
        examInThisGroup.duration,
        "minutes"
      );

      let isExceeded = new Date(endTime) < new Date();
      const { offline } = req.query;
      if (offline) isExceeded = false;
      if (!exam.isPracticeExam && (ended || isExceeded)) {
        res.badRequest({ title: "Exam already finished" });
        return;
      }

      const data = {
        ...req.body,
        examId,
        studentId,
      };

      const isAnswered = await dao.examResult.isStudentAnswered(
        examId,
        studentId,
        questionId,
        groupId,
        answerIndex
      );

      if (!examInThisGroup.multipleTimesSubmission && isAnswered) {
        logger.error(
          `exam-addAnswer: 6. Add answer failed for user ${studentId} in exam: ${examId}, group: ${groupId} with error: You can not update answer`
        );
        res.locked({ title: "You can not update answer" });
        return;
      }
      const doc = getAnswerDoc(data, exam);
      await dao.examResult.insertAnswer(doc, examId, studentId, groupId);
      res.ok({ queued: true });
    } catch (err) {
      logger.error(
        `exam-addAnswer: 7. Add answer failed for user ${studentId} in exam: ${examId}, group: ${groupId} with error: ${err.stack}`
      );
      switch (err.message) {
        case constants.errors.NOT_FOUND:
          res.notFound({ title: "Question not found" });
          break;
        case constants.errors.NOT_UPDATE_ABLE:
          res.locked({ title: "You can not update answer" });
          break;
        default:
          res.serverError(err);
      }
    }
  },

  publish: async (req, res) => {
    try {
      const { studentId, examId, groupId } = req.params;
      const exam = await dao.exam.getById(examId);
      if (!exam) {
        res.notFound({ title: "Exam not found" });
        return;
      }
      const { examInThisGroup } = req;

      const { unpublish } = req.query;
      const publishedAt = unpublish ? 0 : Date.now(); // to hide make it negitive
      const examResult = await dao.examResult.publishUpdate(
        examId,
        studentId,
        groupId,
        publishedAt,
        0,
        examInThisGroup
      );
      if (!examResult) {
        res.notFound({ title: "No submission found" });
        return;
      }
      // ? Not sending notification on individual assessment
      // await resultPublishNotification([studentId], exam.title, examId, examResult._id);
      res.ok(examResult);
    } catch (err) {
      logger.error(
        `exam-publish: Publish failed for user ${req.user.id} in exam: ${req.params.examId} with error: ${err.stack}`
      );
      res.serverError(err);
    }
  },

  submit: async (req, res) => {
    try {
      const {
        params: { examId, groupId },
        examInThisGroup,
      } = req;
      const exam = await dao.exam.getById(examId);
      const { id: studentId, exams } = req.user;
      const startedExam = exams.find((e) => e.exam == examId);
      if (!startedExam) {
        logger.error(
          `exam-submit: 1. submit failed for user ${req.user.id} in exam: ${req.params.examId}, group: ${req.params.groupId} with error: You did not start this exam yet`
        );
        res.forbidden({ title: "You did not start this exam yet!" });
        return;
      }
      if (exam.isPracticeExam) {
        const answers = await dao.examResult.getAnswers(
          examId,
          studentId,
          groupId
        );
        if (answers || answers.length) {
          // TODO: have to add groupId in setAnswers
          await dao.examResult.setAnswers(answers, examId, studentId, groupId);
          await dao.examResult.deleteAnswers(examId, studentId, groupId);
        }
        const examResult = await dao.examResult.publishUpdate(
          examId,
          studentId,
          groupId,
          Date.now(),
          Date.now(),
          examInThisGroup
        );
        if (!examResult) {
          res.notFound({ title: "No submission found" });
          return;
        }
        await resultPublishNotification(
          [studentId],
          exam.title,
          examId,
          examResult._id,
          exam.isPracticeExam
        );
        res.ok(examResult);
        return;
      }

      if (exam) {
        const examResult = await dao.examResult.getByStudentIdAndExamId(
          studentId,
          examId,
          groupId
        );
        if (!examResult) {
          logger.error(
            `exam-submit: 2. submit failed for user ${req.user.id} in exam: ${req.params.examId}, group: ${req.params.groupId} with error: No submission found`
          );
          res.notFound({ title: "You didn't start this exam" });
          return;
        }
        const isRemoved = await dao.examResult.removeFromSet(
          examId,
          studentId,
          groupId
        );
        if (!isRemoved) {
          logger.error(
            `exam-submit: 3. submit failed for user ${req.user.id} in exam: ${req.params.examId}, group: ${req.params.groupId} with error: Submission not removed, already submitted`
          );
          res.ok({ title: "Your exam submitted successfully" });
          return;
        }
        await queue.createJob({ examId, studentId, groupId });
        const result = await dao.examResult.submit(
          examId,
          studentId,
          Date.now()
        );
        res.ok({
          message: "Queued",
          title: "Your exam submitted successfully",
          exam: result,
        });
        logger.info(
          `exam-submit: submit success for user ${req.user.id} in exam: ${req.params.examId}, group: ${req.params.groupId}`
        );
        return;
      }
      res.ok({ title: "Your exam submitted successfully" });
    } catch (err) {
      logger.error(
        `exam-submit: 4. submit failed for user ${req.user.id} in exam: ${req.params.examId}, group: ${req.params.groupId} with error: ${err.stack}`
      );
      //console.log(err);
      res.serverError(err);
    }
  },

  markAnswer: async (req, res) => {
    try {
      const { examId } = req.params;
      const examResult = await dao.examResult.markAnswer({
        examId,
        ...req.body,
      });
      if (!examResult) {
        res.notFound({ title: "No submission found" });
        return;
      }
      res.ok(examResult);
    } catch (err) {
      logger.error(
        `exam-markAnswer: Mark answer failed for user ${req.user.id} in exam: ${req.params.examId} with error: ${err.stack}`
      );
      res.serverError(err);
    }
  },

  retakeExam: async (req, res) => {
    try {
      const { examId, studentId } = req.params;
      const exam = await dao.exam.getById(examId);
      if (!exam) {
        res.notFound({ title: "Exam not found" });
        return;
      }
      if (!exam.isPracticeExam) {
        res.badRequest({ title: "Exam is not practice exam type" });
        return;
      }
      const examResult = await dao.examResult.retakeExam(studentId, examId);
      res.ok(examResult);
    } catch (err) {
      logger.error(
        `exam-retakeExam: Retake exam failed for user ${req.user.id} in exam: ${req.params.examId} with error: ${err.stack}`
      );
      res.serverError(err);
    }
  },

  publishAll: async (req, res) => {
    try {
      const { examId, groupId } = req.params;
      const status = await dao.examResult.getExamResultProcess(examId, groupId);
      if (status === constants.resultStatusInRedis.PROCESSING) {
        res.badRequest({ title: "Exam subimissions are processing" });
        return;
      }
      const { students, sendSms, message, sendToGuardian } = req.body;
      const { ssc, hsc } = req.params;
      const exam = await dao.exam.getById(examId);
      if (!exam) {
        res.notFound({ title: "Exam not found" });
        return;
      }
      const group = await dao.group.getById(groupId, true);
      const examInThisGroup = group.exams.find((e) => {
        if (e && e.examId) {
          return e.examId._id.toString() == examId || e.examId == examId;
        }
        return null;
      });
      if (!examInThisGroup) {
        res.forbidden({ title: "You are not authorized" });
        return;
      }
      if (examInThisGroup.status === constants.exam.status.UNPUBLISHED) {
        res.forbidden({ title: "Exam status is unpublished" });
        return;
      }
      const results = await dao.examResult.publishAll(
        examId,
        students,
        groupId,
        examInThisGroup,
        { ssc, hsc }
      );
      if (results && results.length) {
        const updatedGroup = await dao.group.updateStatus(
          examId,
          groupId,
          constants.exam.status.RESULT_PUBLISHED
        );
        if (!updatedGroup) {
          res.notFound({ title: "Result publish unsuccessful" });
          return;
        }
      }
      if (!results || !results.length) {
        res.notFound({ title: "No submission found" });
        return;
      }
      await resultPublishNotification(
        students,
        exam.title,
        examId,
        results[0] ? results[0]._id : "",
        exam.isPracticeExam
      );
      if (sendSms) {
        const { ranks, highestMark } = utils.rankGenerate(results);
        const messages = generatePublishSMS({
          ranks,
          highestMark,
          results,
          exam,
          message,
          sendToGuardian,
        });
        notificationSender.sendBulkSmsNew(messages);
      }
      res.ok(results);
    } catch (err) {
      if (err.message === constants.errors.NOT_FOUND) {
        res.notFound({ title: "Group not found" });
        return;
      }

      logger.error(
        `exam-publishAll: Publish all failed for exam: ${req.params.examId}, group: ${req.params.groupId} with error: ${err.stack}`
      );

      res.serverError(err);
    }
  },

  aggregate: async (req, res) => {
    try {
      let exams = req.query.exam;
      let groups = req.query.group;
      const { sendSms } = req.query;
      const { sendToGuardian } = req.query;
      const { startString, endString } = req.query;

      if (!exams || !groups) {
        res.badRequest({ title: "Invalid request" });
        return;
      }
      if (!Array.isArray(exams)) exams = [exams];
      if (!Array.isArray(groups)) groups = [groups];

      console.log("exams-->", exams);
      messageq.publish(constants.queue.AGGREGATE, {
        examIds: exams,
        groupIds: groups,
        userId: req.user.id,
        sendSms,
        sendToGuardian,
        startString,
        endString,
      });
      res.ok({
        title: "Your request is processing. Will let you know after finish",
      });
    } catch (err) {
      logger.error(
        `exam-aggregate: Aggregate failed for user ${req.user.id} with error: ${err.stack}`
      );
      res.serverError(err);
    }
  },

  myScoreboard: async (req, res) => {
    try {
      const { lastId } = req.query;
      const { limit } = req.query;
      const { id: studentId } = req.user;
      let analitycs;
      if (!lastId) {
        analitycs = await dao.examResult.studentAnalitycs(studentId);
      }
      const results = await dao.examResult.getByStudentId(studentId, {
        lastId,
        limit,
      });
      res.ok({ analitycs, results });
    } catch (err) {
      logger.error(
        `exam-myScoreboard: Scoreboard failed for student: ${req.user.id} with error: ${err.stack}`
      );
      res.serverError(err);
    }
  },

  scoreboardByStudentId: async (req, res) => {
    try {
      const { lastId } = req.query;
      const { studentId } = req.params;
      let analitycs;
      if (!lastId) {
        analitycs = await dao.examResult.studentAnalitycs(studentId);
      }
      const results = await dao.examResult.getByStudentId(studentId, {
        lastId,
      });
      res.ok({ analitycs, results });
    } catch (err) {
      logger.error(
        `exam-scoreboardByStudentId: Scoreboard by studentId failed for student: ${req.params.studentId} with error: ${err.stack}`
      );
      res.serverError(err);
    }
  },

  processExam: async (req, res) => {
    try {
      const { examId, groupId } = req.params;
      const status = await dao.examResult.getExamResultProcess(examId, groupId);
      const { PROCESSING, NOT_PROCESSED_YET } = constants.resultStatusInRedis;
      if (status === PROCESSING) {
        res.ok({ status, title: "Exam result is processing" });
        return;
      }
      if (status === NOT_PROCESSED_YET) {
        publishMessage(constants.channel.START_PROCESS, { examId, groupId });
        res.ok({ status: PROCESSING, title: "Exam result started processing" });
        return;
      }
      res.ok({ status });
    } catch (err) {
      logger.error(
        `exam-processExam: Process exam failed for exam: ${req.params.examId}, group: ${req.params.groupId} with error: ${err.stack}`
      );
      res.serverError(err);
    }
  },
};
