const RedisSMQ = require('rsmq');
const Redis = require('ioredis');
const config = require('../../config');

const protocol = config.redis.ssl ? 'rediss://' : 'redis://';
const redisURL = `${protocol}:${config.redis.password}@${config.redis.host}:${config.redis.port}`;

let rsmq = null;
const initRSMQ = () => {
  const { client } = new Redis(redisURL);
  if (!rsmq) {
    rsmq = new RedisSMQ({
      client,
      ns: 'rsmq',
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      realtime: true,
    });
  }
  return rsmq;
};

const getRSMQ = () => {
  if (!rsmq) {
    initRSMQ();
  }
  return rsmq;
};

const createQueue = async (queueName) => {
  try {
    const queue = await rsmq.createQueueAsync({
      qname: queueName,
      maxsize: -1,
      vt: 10,
    });
    return queue;
  } catch (err) {
    if (err.message !== 'Queue exists') {
      return Promise.reject(err);
    }
  }
};

const getSubscriber = (queueName) => `rsmq:rt:${queueName}`;

module.exports = {
  getRSMQ, initRSMQ, createQueue, getSubscriber,
};
