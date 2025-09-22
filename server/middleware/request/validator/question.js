const Joi = require("joi");
const constants = require("../../../constants");
const validate = require("./index");
const e = require("express");
Joi.objectId = require("joi-objectid")(Joi);

const create = (req, res, next) => {
  const questionSchema = Joi.object().keys({
    title: Joi.string().trim().required(),
    type: Joi.string()
      .trim()
      .required()
      .custom((value, helper) => {
        const types = Object.values(constants.question.type);
        if (!types.includes(value)) {
          return helper.message("Invalid question type");
        }
        return value;
      }),
    explanation: Joi.string().trim(),
    options: Joi.when("type", {
      is: constants.question.type.MCQ,
      then: Joi.array().min(2).required(),
    }).when("type", {
      is: constants.question.type.CHECKBOX,
      then: Joi.array().min(2).required(),
    }),
    answer: Joi.when("type", {
      is: constants.question.type.MCQ,
      then: Joi.array().min(1).required(),
    }).when("type", {
      is: constants.question.type.CHECKBOX,
      then: Joi.array().min(1).required(),
    }),
    status: Joi.string()
      .trim()
      .custom((value, helper) => {
        const types = Object.values(constants.question.status);
        if (!types.includes(value)) {
          return helper.message("Invalid question status");
        }
        return value;
      }),
    subjectId: Joi.objectId(),
    lectureId: Joi.objectId(),
    chapterId: Joi.objectId(),
    courseId: Joi.objectId().required(),
    questionSolveId: Joi.objectId(),
    URL: Joi.array(),
    image: Joi.array(),
    file: Joi.array(),
    notes: Joi.string().trim(),
    optionType: Joi.object().custom((value, helper) => JSON.stringify(value)),
    explanationExt: Joi.any(),
  });
  const schema = Joi.object().keys({
    questions: Joi.array().min(1).items(questionSchema).required(),
  });
  validate(schema, req, res, next);
};
const update = (req, res, next) => {
  const schema = Joi.object().keys({
    title: Joi.string().trim(),
    type: Joi.string()
      .trim()
      .custom((value, helper) => {
        const types = Object.values(constants.question.type);
        if (!types.includes(value)) {
          return helper.message("Invalid question type");
        }
        return value;
      }),
    explanation: Joi.string().trim(),
    options: Joi.when("type", {
      is: constants.question.type.MCQ,
      then: Joi.array().min(2).required(),
    }).when("type", {
      is: constants.question.type.CHECKBOX,
      then: Joi.array().min(2).required(),
    }),
    answer: Joi.when("type", {
      is: constants.question.type.MCQ,
      then: Joi.array().min(1).required(),
    }).when("type", {
      is: constants.question.type.CHECKBOX,
      then: Joi.array().min(1).required(),
    }),
    status: Joi.string()
      .trim()
      .custom((value, helper) => {
        const types = Object.values(constants.question.status);
        if (!types.includes(value)) {
          return helper.message("Invalid question status");
        }
        return value;
      }),
    subjectId: Joi.objectId(),
    lectureId: Joi.objectId(),
    chapterId: Joi.objectId(),
    courseId: Joi.objectId(),
    questionSolveId: Joi.objectId(),
    URL: Joi.array(),
    image: Joi.array(),
    file: Joi.array(),
    notes: Joi.string().trim(),
    optionType: Joi.object().custom((value, helper) => JSON.stringify(value)),
    explanationExt: Joi.any(),
    explanationTables: Joi.any(),
  });
  validate(schema, req, res, next);
};
module.exports = {
  create,
  update,
};
