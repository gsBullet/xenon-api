const mongoose = require('mongoose');
const logger = require('./winston');
const { mongo } = require('../config');

const connectMongo = () => new Promise((resolve, reject) => {
  mongoose.connect(mongo.mongodbURL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    poolSize: mongo.mongodbPoolSize, // Maintain up to x socket connections
  });

  mongoose.connection.on('connected', () => {
    logger.info('Mongoose connected successfully');
    resolve('connected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`Mongoose default connection has occured ${err} error`);
    reject(err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.error('Mongoose default connection is disconnected');
  });

  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      logger.info('Mongoose default connection is disconnected due to application termination');
      process.exit(0);
    });
  });
});
module.exports = { connectMongo };
