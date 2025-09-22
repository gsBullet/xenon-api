const Joi = require("joi");
const constants = require("../../../constants");
const utils = require("../../../lib/utils");
const validate = require("./index");

module.exports = {
  getOpt: (req, res, next) => {
    const schema = Joi.object().keys({
      password: Joi.string().min(8).max(20).required(),
      handle: Joi.string().trim().required(),
      viaEmail: Joi.boolean(),
    });
    validate(schema, req, res, next);
  },

  verifyLogin: (req, res, next) => {
    const schema = Joi.object().keys({
      hash: Joi.string().required(),
      handle: Joi.string().trim().required(),
      otp: Joi.string().trim().required(),
    });
    validate(schema, req, res, next);
  },

  addAdmin: (req, res, next) => {
    const schema = Joi.object().keys({
      firstName: Joi.string().trim().required(),
      lastName: Joi.string().trim().required(),
      password: Joi.string().min(8).max(20).required(),
      email: Joi.string().trim().email().required(),
      adminId: Joi.string().trim().required(),
      roles: Joi.array()
        .min(1)
        .items(Joi.string())
        .required()
        .custom((value, helper) => {
          const roles = Object.values(constants.admin.roles);
          let flag = true;
          value.forEach((v) => {
            const isExist = roles.includes(v);
            if (!isExist) flag = false;
          });
          if (!flag) {
            return helper.message("Roles should be valid");
          }
          return value;
        }),
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
  },
  updateAdmin: (req, res, next) => {
    const schema = Joi.object().keys({
      firstName: Joi.string().trim(),
      lastName: Joi.string().trim(),
      password: Joi.string().min(8).max(20),
      email: Joi.string().trim().email(),
      adminId: Joi.string().trim(),
      roles: Joi.array()
        .min(1)
        .items(Joi.string())
        .custom((value, helper) => {
          const roles = Object.values(constants.admin.roles);
          let flag = true;
          value.forEach((v) => {
            const isExist = roles.includes(v);
            if (!isExist) flag = false;
          });
          if (!flag) {
            return helper.message("Roles should be valid");
          }
          return value;
        }),
      username: Joi.string()
        .trim()
        .custom((value, helper) => {
          const { isValid, number } = utils.formatNumber(value);
          if (!isValid) {
            return helper.message("Phone number should be valid");
          }
          return number;
        }),
    });
    validate(schema, req, res, next);
  },
  register: (req, res, next) => {
    const schema = Joi.object().keys({
      firstName: Joi.string().trim().required(),
      lastName: Joi.string().trim().required(),
      password: Joi.string().min(8).max(20).required(),
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
  },
  resetPassword: (req, res, next) => {
    const schema = Joi.object().keys({
      oldPassword: Joi.string().trim().required(),
      newPassword: Joi.string().min(8).max(20).required(),
    });
    validate(schema, req, res, next);
  },
};
