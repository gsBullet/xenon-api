const validate = (schema, req, res, next) => {
  const { value, error } = schema.validate(req.body);
  console.log('value error', value, error, 'request path', req.path);
  if (error) {
    res.badRequest({
      title: 'Invalid request data',
      error,
    });
    return;
  }
  req.body = value;
  next();
};
module.exports = validate;
