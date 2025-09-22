const Joi = require('joi');
const validate = require('./index');

const createNewCourse = (req, res, next) => {
  const schema = Joi.object().keys({
    name: Joi.string().trim().required(),
    description: Joi.string().trim().required(),
    image: Joi.string().trim().required(),
    session: Joi.string().trim().required(),
  });
  validate(schema, req, res, next);
};
const updateCourse = (req, res, next) => {
  const schema = Joi.object().keys({
    name: Joi.string().trim(),
    description: Joi.string().trim(),
    image: Joi.string().trim(),
    session: Joi.string().trim(),
  });
  validate(schema, req, res, next);
};
module.exports = { createNewCourse, updateCourse };
