const Joi = require('joi');
const validate = require('./index');
Joi.objectId = require('joi-objectid')(Joi);

const create = (req, res, next) => {
  const schema = Joi.object().keys({
    name: Joi.string().trim().required(),
    subjectId: Joi.objectId().required(),
    description: Joi.string().trim(),
  });
  validate(schema, req, res, next);
};
const update = (req, res, next) => {
  const schema = Joi.object().keys({
    name: Joi.string().trim(),
    subjectId: Joi.objectId(),
    description: Joi.string().trim(),
  });
  validate(schema, req, res, next);
};

const removeUpdateContents = (req, res, next) => {
  const schema = Joi.object().keys({
    videoContents: Joi.array()
      .items(Joi.objectId()).min(1),
    fileContents: Joi.array()
      .items(Joi.objectId()).min(1),
  }).or('videoContents', 'fileContents');
  validate(schema, req, res, next);
};

module.exports = {
  create,
  update,
  removeUpdateContents,
};
