const Joi = require('joi');
const validate = require('./index');
Joi.objectId = require('joi-objectid')(Joi);

const create = (req, res, next) => {
  const schema = Joi.object().keys({
    name: Joi.string().trim().required(),
    image: Joi.string().trim(),
    description: Joi.string().trim(),
    courseId: Joi.objectId().required(),
  });
  validate(schema, req, res, next);
};
const update = (req, res, next) => {
  const schema = Joi.object().keys({
    name: Joi.string().trim(),
    image: Joi.string().trim(),
    description: Joi.string().trim(),
  });
  validate(schema, req, res, next);
};

const reorder = (req, res, next) => {
  const schema = Joi.object().keys({
    lectures: Joi.array().min(1),
    chapters: Joi.array().min(1),
    questionSolves: Joi.array().min(1),
  }).or('lectures', 'chapters', 'questionSolves');
  validate(schema, req, res, next);
};
const start = (req, res, next) => {
  const schema = Joi.object().keys({
    courseId: Joi.objectId().required(),
    subjectId: Joi.objectId().required(),
  });
  validate(schema, req, res, next);
};
module.exports = {
  create,
  reorder,
  update,
  start,
};
