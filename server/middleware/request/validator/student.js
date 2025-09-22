const Joi = require('joi');
const { ObjectId } = require('mongoose').Types;
const constants = require('../../../constants');
const utils = require('../../../lib/utils');
const validate = require('./index');
const config = require('../../../config');
Joi.objectId = require('joi-objectid')(Joi);

const addStudent = (req, res, next) => {
  const schema = Joi.object().keys({
    name: Joi.string().trim().required(),
    session: Joi.string().trim().required(),
    sid: Joi.string().trim().required(),
    HSCGPA: Joi.number().min(1),
    SSCGPA: Joi.number().min(1),
    firstTime: Joi.boolean().required(),
    branch: Joi.objectId().required(),
    username: Joi.string().trim().required()
      .custom((value, helper) => {
        const { isValid, number } = utils.formatNumber(value);
        if (!isValid) {
          return helper.message('Phone number should be valid');
        }
        return number;
      }),
    contact: Joi.string().trim().required()
      .custom((value, helper) => {
        const { isValid, number } = utils.formatNumber(value);
        if (!isValid) {
          return helper.message('Phone number should be valid');
        }
        return number;
      }),
    courses: Joi.array().min(1).items(Joi.string()).required()
      .custom((value, helper) => {
        const isValidId = value.every((v) => ObjectId.isValid(v));
        if (!isValidId) { return helper.message('Course ID is not valid'); }
        return value;
      }),
  });
  validate(schema, req, res, next);
};

const courseAddRemove = (req, res, next) => {
  const schema = Joi.object().keys({
    id: Joi.objectId().required(),
    courses: Joi.array().min(1).items(Joi.string()).required()
      .custom((value, helper) => {
        const isValidId = value.every((v) => ObjectId.isValid(v));
        if (!isValidId) { return helper.message('Course ID is not valid'); }
        return value;
      }),
  });
  validate(schema, req, res, next);
};
const updateStatusMultiple = (req, res, next) => {
  const schema = Joi.object().keys({
    status: Joi.string().trim().required(),
    students: Joi.array().min(1).required(),
  });
  validate(schema, req, res, next);
};
const updateStatus = (req, res, next) => {
  const schema = Joi.object().keys({
    status: Joi.string().required()
      .custom((value, helper) => {
        const isValidId = Object.values(constants.student.status).includes(value);
        if (!isValidId) { return helper.message('Invalid status type'); }
        return value;
      }),
  });
  validate(schema, req, res, next);
};
const setPassword = (req, res, next) => {
  const schema = Joi.object().keys({
    phone: Joi.string().trim().required()
      .custom((value, helper) => {
        const { isValid, number } = utils.formatNumber(value);
        if (!isValid) {
          return helper.message('Phone number should be valid');
        }
        return number;
      }),
    password: Joi.string().trim().min(7).required(),
    otp: Joi.string().trim().length(config.otp.length).required(),
    hash: Joi.string().trim().required(),
  });
  validate(schema, req, res, next);
};

const login = (req, res, next) => {
  const schema = Joi.object().keys({
    username: Joi.string().trim().required()
      .custom((value, helper) => {
        const { isValid, number } = utils.formatNumber(value);
        if (!isValid) {
          return helper.message('Phone number should be valid');
        }
        return number;
      }),
    password: Joi.string().trim().min(7).required(),
  });
  validate(schema, req, res, next);
};
const updateProfile = (req, res, next) => {
  const schema = Joi.object().keys({
    name: Joi.string().trim(),
    HSCGPA: Joi.number().min(1),
    SSCGPA: Joi.number().min(1),
    firstTime: Joi.boolean(),
    profilePic: Joi.string().trim(),
  });
  validate(schema, req, res, next);
};
const updateProfileById = (req, res, next) => {
  const schema = Joi.object().keys({
    name: Joi.string().trim(),
    HSCGPA: Joi.number().min(1),
    SSCGPA: Joi.number().min(1),
    firstTime: Joi.boolean(),
    session: Joi.string().trim(),
    branch: Joi.objectId(),
    sid: Joi.string().trim(),
    profilePic: Joi.string().trim(),
    username: Joi.string().trim()
      .custom((value, helper) => {
        const { isValid, number } = utils.formatNumber(value);
        if (!isValid) {
          return helper.message('Phone number should be valid');
        }
        return number;
      }),
    contact: Joi.string().trim()
      .custom((value, helper) => {
        const { isValid, number } = utils.formatNumber(value);
        if (!isValid) {
          return helper.message('Phone number should be valid');
        }
        return number;
      }),
  });
  validate(schema, req, res, next);
};
module.exports = {
  updateProfile,
  addStudent,
  courseAddRemove,
  updateStatus,
  setPassword,
  login,
  updateProfileById,
  updateStatusMultiple,
};
