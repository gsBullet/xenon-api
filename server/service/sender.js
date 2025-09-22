const constants = require('../constants');
const rsmq = require('../lib/redis/rsmq');

const instance = rsmq.getRSMQ();
const sendMail = async (msg) => {
  const ret = await instance.sendMessageAsync({
    qname: constants.queue.EMAIL_QUEUE,
    message: msg,
  });
  console.log('hello', ret);
};

module.exports = { sendMail };
