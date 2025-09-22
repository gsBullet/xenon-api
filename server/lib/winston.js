const winston = require('winston');

const { createLogger, transports, format } = winston;

const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
  ),
  transports: [
    // new transports.File({
    //   format: format.json(),
    //   filename: './logs/logs.log',
    //   colorize: false,
    //   handleExceptions: true,
    //   json: true,
    //   level: 'error',
    //   maxsize: 5242880, // 5MB
    //   maxFiles: 5,
    //   prepend: true,
    // }),
    new transports.Console(
      { handleExceptions: true },
    ),
  ],
  exitOnError: false,
});

module.exports = logger;
