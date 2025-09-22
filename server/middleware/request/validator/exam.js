/* eslint-disable no-underscore-dangle */
const Joi = require("joi");
const { ObjectId } = require("mongoose").Types;
const constants = require("../../../constants");
const validate = require("./index");
Joi.objectId = require("joi-objectid")(Joi);
const dao = require("../../../data");
const utils = require("../../../lib/utils");
const { shuffle } = require("ioredis/built/utils");

const create = (req, res, next) => {
  const questionSchema = Joi.object().keys({
    question: Joi.objectId().required(),
    point: Joi.number().default(req.body.globalPoint),
  });
  const schema = Joi.object().keys({
    title: Joi.string().required(),
    instruction: Joi.string().required(),
    courseId: Joi.objectId().required(),
    subjectId: Joi.objectId().when("isSegmentedExam", {
      is: false,
      then: Joi.objectId().required(),
    }
    ),
    isPracticeExam: Joi.boolean().required(),
    passMark: Joi.number().min(0).required(),
    totalMarks: Joi.number().min(1).required(),
    negativeMarkPerQuestion: Joi.number().min(0).required(),
    shuffle: Joi.boolean().required(),
    globalPoint: Joi.number().min(0).required(),
    isSegmentedExam: Joi.boolean().required(),
    segmentedExamDetails: Joi.object().when("isSegmentedExam", {
      is: true,
      then: Joi.object().required(),
    }),
    questions: Joi.array().min(1).items(questionSchema).required(),
  });
  validate(schema, req, res, next);
};
const addQuestion = (req, res, next) => {
  const questionSchema = Joi.object().keys({
    question: Joi.objectId().required(),
    point: Joi.number().min(0).required(),
  });
  const schema = Joi.object().keys({
    questions: Joi.array().min(1).items(questionSchema).required(),
  });
  validate(schema, req, res, next);
};
const update = (req, res, next) => {
  const schema = Joi.object().keys({
    title: Joi.string(),
    courseId: Joi.objectId(),
    subjectId: Joi.objectId(),
    isPracticeExam: Joi.boolean(),
    passMark: Joi.number().min(0),
    totalMarks: Joi.number().min(1),
    negativeMarkPerQuestion: Joi.number().min(0),
    multipleTimesSubmission: Joi.boolean(),
    status: Joi.string()
      .trim()
      .custom((value, helper) => {
        const { REJECTED, APPROVED, PENDING } = constants.exam.status;
        const isValid = [REJECTED, APPROVED, PENDING].includes(value);
        if (!isValid) {
          return helper.message("Status should be valid");
        }
        return value;
      }),
  });
  validate(schema, req, res, next);
};
const markAnswer = (req, res, next) => {
  const schema = Joi.object().keys({
    questionId: Joi.objectId().required(),
    studentId: Joi.objectId().required(),
    marks: Joi.number().required(),
    notes: Joi.string().empty("").allow(null),
    extra: Joi.any(),
  });
  validate(schema, req, res, next);
};
const publishAll = (req, res, next) => {
  const schema = Joi.object().keys({
    students: Joi.array()
      .min(1)
      .required()
      .custom((value, helper) => {
        const isValidId = value.every((v) => ObjectId.isValid(v));
        if (!isValidId) {
          return helper.message("Student ID is not valid");
        }
        return value;
      }),
    sendSms: Joi.boolean().required(),
    sendToGuardian: Joi.boolean().required(),
    message: Joi.when("sendSms", {
      is: true,
      then: Joi.object().keys({
        startString: Joi.string().trim(),
        endString: Joi.string().trim(),
      }),
    }),
  });
  validate(schema, req, res, next);
};
const addAnswer = (req, res, next) => {
  const schema = Joi.object().keys({
    questionId: Joi.objectId().required(),
    answer: Joi.any(),
    extra: Joi.any(),
    answerIndex: Joi.number().optional(),
    timestamp: Joi.number().required(),
  });
  validate(schema, req, res, next);
};

const isEvaluatable = async (req, res, next) => {
  const { groupId, examId } = req.params;
  const group = await dao.group.getById(groupId, true);
  if (!group) {
    res.notFound({ title: "Group not found" });
    return;
  }
  const examInThisGroup = group.exams.find((e) => {
    // eslint-disable-next-line eqeqeq
    if (e && e.examId) return e.examId._id == examId;
    return null;
  });
  if (!examInThisGroup) {
    res.forbidden({ title: "Exam not exist in this group" });
    return;
  }
  const { endsAt, startsAt } = examInThisGroup;
  const { ended } = utils.timeRangeChecker(endsAt, startsAt);
  if (!ended) {
    res.badRequest({ title: "You can not evaluate before ending the exam" });
    return;
  }
  req.examInThisGroup = examInThisGroup;
  next();
};

const isSubmissionProcessable = async (req, res, next) => {
  const { groupId, examId } = req.params;
  const group = await dao.group.getById(groupId, true);
  if (!group) {
    res.notFound({ title: "Group not found" });
    return;
  }
  const examInThisGroup = group.exams.find((e) => {
    // eslint-disable-next-line eqeqeq
    if (e && e.examId) return e.examId._id == examId;
    return null;
  });
  if (!examInThisGroup) {
    res.forbidden({ title: "Exam not exist in this group" });
    return;
  }
  const { endsAt, startsAt } = examInThisGroup;
  const { ended } = utils.timeRangeChecker(endsAt, startsAt);
  if (!ended) {
    res.badRequest({ title: "Exam not ended yet" });
    return;
  }
  req.examInThisGroup = examInThisGroup;
  next();
};

module.exports = {
  create,
  update,
  addQuestion,
  markAnswer,
  publishAll,
  addAnswer,
  isEvaluatable,
  isSubmissionProcessable,
};
