const morgan = require('morgan');
const logger = require('../lib/winston');

morgan('combined');
logger.stream = {
  write: (message) => {
    const [,, status] = message.split(' ');
    if (Number(status) >= 200 && Number(status) < 400) {
      logger.info(message.substring(0, message.lastIndexOf('\n')));
    } else {
      logger.error(message.substring(0, message.lastIndexOf('\n')));
    }
  },
};

module.exports = morgan(
  ':method :url :status :response-time ms - :res[content-length]',
  { stream: logger.stream },
);
