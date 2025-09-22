const Joi = require("joi");
const constants = require("../../../constants");
const utils = require("../../../lib/utils");
const validate = require("./index");
const { move } = require("../../../routes/admin");
Joi.objectId = require("joi-objectid")(Joi);

const createNewGroup = (req, res, next) => {
  const schema = Joi.object().keys({
    name: Joi.string().trim().required(),
    image: Joi.string().trim().required(),
    session: Joi.string().trim().required(),
    courseId: Joi.string().trim().required(),
    groupId: Joi.string().trim(),
  });
  validate(schema, req, res, next);
};
const addStudent = (req, res, next) => {
  const schema = Joi.object().keys({
    username: Joi.string()
      .trim()
      .required()
      .custom((value, helper) => {
        const { isValid, number } = utils.formatNumber(value);
        if (!isValid) {
          return helper.message("Phone number should be valid");
        }
        return number;
      }),
  });
  validate(schema, req, res, next);
};
const removeAddGroupForStudent = (req, res, next) => {
  const schema = Joi.object().keys({
    usernames: Joi.array()
      .min(1)
      .required()
      .custom((value, helper) => {
        const numbers = [];
        let validFlag = true;
        value.forEach((v) => {
          const { isValid, number } = utils.formatNumber(v);
          if (!isValid) {
            validFlag = false;
          } else {
            numbers.push(number);
          }
        });
        if (!validFlag) {
          return helper.message("Phone number should be valid");
        }
        return numbers;
      }),
  });
  validate(schema, req, res, next);
};
const addExam = (req, res, next) => {
  const schema = Joi.object().keys({
    startsAt: Joi.date()
      .required()
      .custom((value) => new Date(value)),
    examId: Joi.objectId().required(),
    duration: Joi.number().min(1),
    addGPA: Joi.boolean().required(),
    hsc: Joi.number().optional(),
    ssc: Joi.number().optional(),
    isCutMarks: Joi.boolean().optional(),
    moveToPractice: Joi.boolean().optional(),
    moveToPracticeAfter: Joi.date().optional(),
    cutMarks: Joi.number().optional(),
    multipleTimesSubmission: Joi.boolean().required(),
    type: Joi.string()
      .trim()
      .required()
      .custom((v, h) => {
        const isValid = Object.values(constants.exam.type).includes(v);
        if (!isValid) {
          return h.message("Type should be valid");
        }
        return v;
      }),
    endsAt: Joi.when("type", {
      is: constants.exam.type.LIVE,
      then: Joi.date()
        .required()
        .custom((value) => new Date(value)),
    }),
    publishedAt: Joi.number().integer().max(0),
  });
  validate(schema, req, res, next);
};
const updateExam = (req, res, next) => {
  const schema = Joi.object().keys({
    startsAt: Joi.date()
      .required()
      .custom((value) => new Date(value)),
    duration: Joi.number().min(1).required(),
    addGPA: Joi.boolean().required(),
    multipleTimesSubmission: Joi.boolean().required(),
    hsc: Joi.number().optional(),
    ssc: Joi.number().optional(),
    moveToPractice: Joi.boolean().optional(),
    isCutMarks: Joi.boolean().optional(),
    cutMarks: Joi.number().optional(),
    status: Joi.string()
      .trim()
      .required()
      .custom((v, h) => {
        const isValid = Object.values(constants.exam.status).includes(v);
        if (!isValid) {
          return h.message("Status should be valid");
        }
        return v;
      }),
    publishedAt: Joi.number().required().integer(),
    type: Joi.string()
      .trim()
      .required()
      .custom((v, h) => {
        const isValid = Object.values(constants.exam.type).includes(v);
        if (!isValid) {
          return h.message("Type should be valid");
        }
        return v;
      }),
    endsAt: Joi.when("type", {
      is: constants.exam.type.LIVE,
      then: Joi.date()
        .required()
        .custom((value) => new Date(value)),
    }),
  });
  validate(schema, req, res, next);
};
module.exports = {
  addExam,
  createNewGroup,
  addStudent,
  removeAddGroupForStudent,
  updateExam,
};
