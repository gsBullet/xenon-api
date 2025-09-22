const decycle = require('../lib/decycle');
const logger = require('../lib/winston');

module.exports = (req, res, next) => {
  const responseTypes = {
    ok: '200',
    badRequest: '400',
    unauthorized: '401',
    forbidden: '403',
    notFound: '404',
    serverError: '500',
    conflict: '409',
    locked: '423',
  };

  Object.keys(responseTypes).forEach((response) => {
    res[response] = (data, opt) => {
      // eslint-disable-next-line no-param-reassign
      if (!opt || typeof opt !== 'object') opt = {};
      // eslint-disable-next-line no-param-reassign
      opt = { logError: true, ...opt };
      const statusCode = responseTypes[response];
      res.header('Server', 'Xenon Academy');
      res.status(statusCode);
      const resJSON = {
        status: statusCode,
      };
      if (statusCode !== '200' && statusCode !== '500') {
        resJSON.errors = data;
      }
      if (statusCode === '200') {
        resJSON.data = data;
      }
      if (statusCode === '500') {
        if (process.env.NODE_ENV !== 'production') {
          resJSON.errors = {
            title: 'Something went wrong, try again',
            error: decycle(data),
          };
        } else {
          resJSON.errors = { title: 'Something went wrong, try again' };
        }
        // eslint-disable-next-line no-param-reassign
        data.url = req.url;
        if (opt.logError) logger.error(data);
      }
      res.json(resJSON);
    };
  });
  next();
};
