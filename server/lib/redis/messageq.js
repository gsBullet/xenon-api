const { getClients } = require('./index');
const dao = require('../../data');
const utils = require('../utils');
const constants = require('../../constants');
const { generateMeritList } = require('../csvGenerator');
const { generatePublishSMSAggregate } = require('../exam');
const notificationSender = require('../notification');

/*
 * MessageQ (message queue) is implemented to process single metit list generate API at a time
 * Mechanism:
 *  * Queued new request via 'publish'
 *  * Heartbeat checker checks is queue has any request and is it locked on every 10 secs cycle
 *  * If it's not proccessing any request (unlocked) then start proccess
 *    one request and make lock status true
 */

const getKey = (queue) => `redismq:${queue}`;
const { client } = getClients();
const TTL = 5 * 60;

const publish = (queue, data) => {
  const JO = utils.doStringify(data);
  const push = client.rpush(getKey(queue), JO);
  return push;
};

const isLocked = async (queue) => {
  const val = await client.get(`${getKey(queue)}:lock`);
  return val === 'true';
};

const lock = (queue) => {
  if (!queue) throw new Error('Invalid queue name');
  client.set(`${getKey(queue)}:lock`, true, 'EX', TTL);
};

const unlock = (queue) => {
  if (!queue) throw new Error('Invalid queue name');
  client.set(`${getKey(queue)}:lock`, false, 'EX', TTL);
};

// function extractUsernamesAndContacts(data) {
//   const usernames = data.map((entry) => entry.student.username);
//   const contacts = data.map((entry) => entry.student.contact);
//   return { usernames, contacts };
// }

const queueChecker = async (queue) => {
  const isLockedFlag = await isLocked(queue);
  if (!isLockedFlag) {
    lock(queue);
    const JO = await client.lpop(getKey(queue));
    const data = utils.doParse(JO);
    if (queue === constants.queue.AGGREGATE && data && data.examIds && data.groupIds) {
      const aggregatedData = await dao.examResult.aggregate(data.examIds, data.groupIds);
      const results = await generateMeritList(data, aggregatedData);
      console.log('results-->', results);
      const messages = generatePublishSMSAggregate({
        message: { startString: data.startString, endString: data.endString },
        highestMark: results[0].totalMarks,
        results,
        sendToGuardian: data.sendToGuardian,
      });

      console.log('data-->', data);
      if (data.sendSms === 'true') {
        // No such function in notification.js
        // notificationSender.sendBulkSmsNew(messages); 

        notificationSender.sendBulkSms(messages);
      }
      console.log('messages-->', messages);

      // const { usernames, contacts } = extractUsernamesAndContacts(aggregatedData);
      // console.log('Aggregating data for merit list', usernames, contacts);
      // if (data.sendSms === 'true') {
      //   console.log('Sending SMS for merit list');
      //   if (data.sendToGuardian === 'true') {
      //     console.log('Sending merit list to guardian');
      //   }
      // }
    }
  }
  unlock(queue);
};

const init = async (queue) => {
  await queueChecker(queue);
  setInterval(async () => {
    await queueChecker(queue);
  }, 1000 * 10);
};

module.exports = {
  init,
  publish,
};
