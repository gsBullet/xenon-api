const Joi = require('joi');
const constants = require('../../../constants');
const utils = require('../../../lib/utils');
const validate = require('./index');
Joi.objectId = require('joi-objectid')(Joi);

const create = (req, res, next) => {
  const schema = Joi.object().keys({
    type: Joi.string().trim().required().custom((value, helper) => {
      const isValid = Object.values(constants.notification.type).includes(value);
      if (!isValid) return helper.message('Type should be valid');
      return value;
    }),
    message: Joi.string().trim().required(),
    info: Joi.object(),
    students: Joi.array().min(1),
    sms: Joi.array().custom((values, helper) => {
      let validFlag = true;
      values.forEach((v) => {
        const { isValid } = utils.formatNumber(v);
        if (!isValid) validFlag = false;
      });
      if (!validFlag) {
        return helper.message('Phone number should be valid');
      }
      return values;
    }),
    sendToGuardian: Joi.boolean().required(),
  }).or('students', 'sms');
  validate(schema, req, res, next);
};

module.exports = {
  create,
};
