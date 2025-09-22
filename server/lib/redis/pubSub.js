const { getClients } = require('./index');
const utils = require('../utils');

const { ioPub } = getClients();

const publishMessage = (channel, msg) => {
  console.log('MSG: ', msg);
  const JO = utils.doStringify(msg);
  ioPub.publish(channel, JO);
};

module.exports = {
  publishMessage,
};
