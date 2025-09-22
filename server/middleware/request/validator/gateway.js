const Joi = require('joi');
const constants = require('../../../constants');
const validate = require('./index');

const setSmsGateway = (req, res, next) => {
  const schema = Joi.object().keys({
    gateway: Joi.string().required()
      .custom((value, helper) => {
        // generate array of values in constants.smsGateway
        const gateways = Object.values(constants.smsGateway);
        // check if value is in keys        
        if (!gateways.includes(value)) {
          return helper.message('Invalid Gateway');
        }
        return value;
      }),
  });
  validate(schema, req, res, next);
};
module.exports = { setSmsGateway };
