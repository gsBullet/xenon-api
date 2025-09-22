const Joi = require('joi');
const utils = require('../../../lib/utils');
const validate = require('./index');

const createNewBranch = (req, res, next) => {
  const schema = Joi.object().keys({
    name: Joi.string().trim().required(),
    division: Joi.string().trim().required(),
    address: Joi.string().trim(),
    phone: Joi.string().trim()
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
const updateBranch = (req, res, next) => {
  const schema = Joi.object().keys({
    name: Joi.string().trim(),
    code: Joi.string().trim(),
    address: Joi.string().trim(),
    phone: Joi.string().trim()
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
  createNewBranch,
  updateBranch,
};
