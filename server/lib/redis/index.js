const Redis = require('ioredis');

const config = require('../../config');
const logger = require('../winston');

const protocol = config.redis.ssl ? 'rediss://' : 'redis://';
const redisURL = `${protocol}:${config.redis.password}@${config.redis.host}:${config.redis.port}`;

let client;
let ioPub;
let ioSub;
let pipeLine;
let pipeInit = false;
let ioPubInit = false;
let ioSubInit = false;
let clientInit = false;
let initFailed = false;
const checkInit = () => (!initFailed && clientInit && ioPubInit && ioSubInit && pipeInit);

const init = (callback) => {
  client = new Redis(redisURL);
  ioPub = new Redis(redisURL);
  ioSub = new Redis(redisURL);
  pipeLine = new Redis(redisURL);
  client.on('error', (err) => {
    logger.error(err);
    console.error(err);
    if (!initFailed) {
      initFailed = true;
      callback(err);
    }
  });
  pipeLine.on('error', (err) => {
    logger.error(err);
    console.error(err);
    if (!initFailed) {
      initFailed = true;
      callback(err);
    }
  });
  ioPub.on('error', (err) => {
    logger.error(err);
    console.error(err);
    if (!initFailed) {
      initFailed = true;
      callback(err);
    }
  });
  ioSub.on('error', (err) => {
    logger.error(err);
    console.error(err);
    if (!initFailed) {
      initFailed = true;
      callback(err);
    }
  });
  client.on('connect', () => {
    clientInit = true;
    if (checkInit()) callback();
  });
  ioPub.on('connect', () => {
    ioPubInit = true;
    if (checkInit()) callback();
  });
  ioSub.on('connect', () => {
    ioSubInit = true;
    if (checkInit()) callback();
  });
  pipeLine.on('connect', () => {
    pipeInit = true;
    if (checkInit()) callback();
  });
};

const close = (cb) => {
  client.disconnect();
  ioPub.disconnect();
  ioSub.disconnect();
  pipeLine.disconnect();
  setImmediate(cb);
};

const getClients = () => {
  if (!checkInit()) {
    throw new Error('Redis is not initialized');
  }
  return {
    client, ioPub, ioSub, pipeLine,
  };
};

module.exports = { init, close, getClients };
