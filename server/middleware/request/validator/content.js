const Joi = require('joi');
const { ObjectId } = require('mongoose').Types;
const constants = require('../../../constants');
const validate = require('./index');
Joi.objectId = require('joi-objectid')(Joi);

const create = (req, res, next) => {
  const contentTypes = Object.values(constants.content.types);
  const schema = Joi.object().keys({
    title: Joi.string().trim().required(),
    type: Joi.string().required().custom((value, helper) => {
      const isValid = contentTypes.includes(value);
      if (!isValid) { return helper.message('Content type should be valid'); }
      return value;
    }),
    key: Joi.string().trim(),
    URL: Joi.string().trim(),
    isVOD: Joi.boolean(),
    isAvailable: Joi.boolean(),
    thumbnail: Joi.string().trim(),
    chapters: Joi.array().length(1).custom((value, helper) => {
      const isValidId = value.every((v) => ObjectId.isValid(v));
      if (!isValidId) { return helper.message('Chapter ID is not valid'); }
      return value;
    }),
    courses: Joi.array().length(1).required().custom((value, helper) => {
      const isValidId = value.every((v) => ObjectId.isValid(v));
      if (!isValidId) { return helper.message('Course ID is not valid'); }
      return value;
    }),
    lectures: Joi.array().length(1).custom((value, helper) => {
      const isValidId = value.every((v) => ObjectId.isValid(v));
      if (!isValidId) { return helper.message('Lecture ID is not valid'); }
      return value;
    }),
    questionSolves: Joi.array().length(1).custom((value, helper) => {
      const isValidId = value.every((v) => ObjectId.isValid(v));
      if (!isValidId) { return helper.message('Question Solve ID is not valid'); }
      return value;
    }),
    subjects: Joi.array().length(1).required().custom((value, helper) => {
      const isValidId = value.every((v) => ObjectId.isValid(v));
      if (!isValidId) { return helper.message('Lecture ID is not valid'); }
      return value;
    }),
  }).or('key', 'URL').or('chapters', 'lectures', 'questionSolves');
  validate(schema, req, res, next);
};

const update = (req, res, next) => {
  const contentTypes = Object.values(constants.content.types);
  const schema = Joi.object().keys({
    title: Joi.string().trim(),
    type: Joi.string().custom((value, helper) => {
      const isValid = contentTypes.includes(value);
      if (!isValid) { return helper.message('Content type should be valid'); }
      return value;
    }),
    key: Joi.string().trim(),
    URL: Joi.string().trim(),
    thumbnail: Joi.string().trim(),
    courses: Joi.array().length(1).custom((value, helper) => {
      const isValidId = value.every((v) => ObjectId.isValid(v));
      if (!isValidId) { return helper.message('Course ID is not valid'); }
      return value;
    }),
    subjects: Joi.array().length(1).custom((value, helper) => {
      const isValidId = value.every((v) => ObjectId.isValid(v));
      if (!isValidId) { return helper.message('Lecture ID is not valid'); }
      return value;
    }),
  }).or('key', 'URL');
  validate(schema, req, res, next);
};

const updateOrder = (req, res, next) => {
  const schema = Joi.object().keys({
    contents: Joi.array().min(1).required()
      .custom((value, helper) => {
        const isValidId = value.every((v) => ObjectId.isValid(v));
        if (!isValidId) { return helper.message('Content ID is not valid'); }
        return value;
      }),
  });
  validate(schema, req, res, next);
};
const addAccess = (req, res, next) => {
  const schema = Joi.object().keys({
    lectureId: Joi.objectId(),
    chapterId: Joi.objectId(),
    questionSolveId: Joi.objectId(),
  }).or('lectureId', 'chapterId', 'questionSolveId');
  validate(schema, req, res, next);
};
const markAsComplete = (req, res, next) => {
  const schema = Joi.object().keys({
    courseId: Joi.objectId().required(),
    subjectId: Joi.objectId().required(),
    type: Joi.string().required().custom((value, helper) => {
      const isVaild = Object.values(constants.content.types).includes(value);
      if (!isVaild) return helper.message('Content type should be valid');
      return value;
    }),
  });
  validate(schema, req, res, next);
};
module.exports = {
  update,
  create,
  updateOrder,
  markAsComplete,
  addAccess,
};
