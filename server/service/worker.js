const constants = require('../constants');
const rsmq = require('../lib/redis/rsmq');
const redis = require('../lib/redis/index');
const logger = require('../lib/winston');
const ses = require('../lib/ses/email');

const MAILER_SUB_PATTERN = rsmq.getSubscriber(constants.queue.EMAIL_QUEUE);
const instance = rsmq.getRSMQ();

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

const handleMsg = async () => {
  try {
    const msg = await instance.receiveMessageAsync({ qname: constants.queue.EMAIL_QUEUE });
    if (!isEmpty(msg)) {
      await ses.formatEmailAndSend(JSON.parse(msg.message));
      await instance.deleteMessageAsync({
        qname: constants.queue.EMAIL_QUEUE,
        id: msg.id,
      });
      await handleMsg();
    }
  } catch (err) {
    logger.error(err);
  }
};

const setupRedis = async () => {
  await new Promise((resolve, reject) => {
    redis.init((err) => {
      if (err) reject(err);
      else {
        logger.info('Redis connected successfully');
        resolve();
      }
    });
  });
  const { ioSub } = redis.getClients();
  ioSub.subscribe(MAILER_SUB_PATTERN);
  ioSub.on('message', () => handleMsg());
};

handleMsg();
setupRedis().catch(logger.error);
