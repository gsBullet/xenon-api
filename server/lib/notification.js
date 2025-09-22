/* eslint-disable no-await-in-loop */
const axios = require('axios');
const constants = require('../constants');
const io = require('../socketIo').getIo();
const config = require('../config');
const utils = require('./utils');
const logger = require('./winston');
const dao = require('../data');

const sendSocketNotification = (users, event, message) => {
    users.forEach((user) => {
        io.of('/').to(user).emit(event, message);
    });
};

const notifyGroupStudent = (groupId, message) => {
    io.of('/').to(groupId).emit(constants.socket.events.NOTIFICATION, message);
};

const notifyUser = (user, message) => {
    sendSocketNotification([user], constants.socket.events.NOTIFICATION, message);
};
const sendFileGeneratedNotification = (user, message) => {
    sendSocketNotification([user], constants.socket.events.CSV_GENERATED, message);
};
const notifyUsers = (users, message) => {
    sendSocketNotification(users, constants.socket.events.NOTIFICATION, message);
};

/**
 * @async
 * @static
 * @param {string} to
 * @param {string} text
 * @returns {Promise<boolean>} whether the sms send request succeded
 */
const sendSmsInfobip = async (to, text) => {
    const url = 'https://pmvqe.api.infobip.com/sms/1/text/single';
    const data = {
        from: config.notification.infobipSmsFrom,
        to,
        text,
    };
    // console.log('Infobip SMS DATA : ', data);
    const options = {
        headers: {
            'content-type': 'application/json',
            Authorization: `App ${config.notification.infobipSmsApiKey}`,
            Accept: 'application/json',
        },
    };
    console.log('Infobip SMS TEXT: ', text);
    try {
        const response = await axios.post(url, JSON.stringify(data), options);
        const { status } = response;
        console.dir(response.data, { depth: null });
        if (status === 200) return true;
        logger.error(`SMS send unsuccessful: ${status}`);
    } catch (err) {
        console.log('Infobip SMS sending failed: ', err.stack);
    }
    return false;
};

const sendSmsREVE = async (to, text) => {
    // const url = 'http://188.138.41.146:7788/sendtext';
    const url = 'https://smpp.revesms.com:7790/sendtext';
    const data = {
        callerID: config.notification.reveSmsFrom,
        toUser: to,
        messageContent: text,
        apikey: config.notification.reveSmsApiKey,
        secretkey: config.notification.reveSmsSecretKey
    };
    // console.log('REVE SMS DATA : ', data);
    const options = {
        headers: {
            'content-type': 'application/json',
            Authorization: `App ${config.notification.reveSmsApiKey}`,
            Accept: 'application/json',
        },
    };
    // console.log('REVE SMS TEXT : ', text);
    try {
        const response = await axios.post(url, JSON.stringify(data), options);
        const { status } = response;
        console.dir(response.data, { depth: null });
        if (status === 200) return true;
        console.log(`REVE SMS send unsuccessful: ${status}`);
    } catch (err) {
        console.log('REVE SMS sending failed: ', err.stack);
    }
    return false;
};

const sendSmsROBI = async (to, text) => {
    const url = 'https://api.mobireach.com.bd/SendTextMessage';

    const queryObj = {
        Username: config.notification.robiSmsUsername,
        Password: config.notification.robiSmsPassword,
        From: config.notification.robiSmsFrom,
        To: to,
        Message: text,
    }
    const queryParam = utils.constructQueryString(queryObj);

    // console.log('ROBI SMS TEXT : ', text);
    try {
        const response = await axios.get(`${url}?${queryParam}`);
        const { status } = response;
        console.dir(response.data, { depth: null });
        if (status === 200) return true;
        console.log(`ROBI SMS send unsuccessful: ${status}`);
    } catch (err) {
        console.log('ROBI SMS sending failed: ', err.stack);
    }
    return false;
};

const sendBulkInfobipSms = async (sms = [], message = '') => {
    if (!Array.isArray(sms)) {
        // eslint-disable-next-line no-param-reassign
        sms = [sms];
    }
    const url = 'https://pmvqe.api.infobip.com/sms/2/text/advanced';
    const messages = sms.map((s) => ({
        from: config.notification.infobipSmsFrom,
        destinations: [{ to: s.to || s }],
        text: s.text || message,
    }));
    console.log('INFOBIP BULK SMS ', message);
    const options = {
        headers: {
            'content-type': 'application/json',
            Authorization: `App ${config.notification.infobipSmsApiKey}`,
            Accept: 'application/json',
        },
    };
    const response = await axios.post(url, JSON.stringify({ messages }), options);
    const { status } = response;
    if (status === 200) return true;
    logger.error(`INFOBIP SMS send unsuccessful: ${status}`);
    return false;
};


const sendBulkMetroSms = async (sms = [], message = '') => {
    if (!Array.isArray(sms)) {
        // eslint-disable-next-line no-param-reassign
        sms = [sms];
    }
    const messages = sms.map((s) => ({
        to: s.to || s,
        message: s.text || message,
    }));

    const url = 'http://portal.metrotel.com.bd/smsapimany';
    const data = {
        api_key: config.notification.metroSmsApiKey,
        senderid: config.notification.metroSmsFrom,
        messages,
    };
    console.log('METRO BULK SMS TEXT: ', messages);
    const response = await axios.post(url, data);
    const { status } = response;
    if (status === 200) return true;
    logger.error(`SMS send unsuccessful: ${status}`);
    return false;
};

const sendBulkReveSms = async (sms = [], message = '') => {
    if (!Array.isArray(sms)) {
        sms = [sms];
    }
    sms.forEach(singleSMS => {
        // console.log('REVE SMS IN LOOP ', singleSMS);
        sendSmsREVE(singleSMS.to || singleSMS, singleSMS.text || message);
    });
    return true;
};

const sendBulkRobiSms = async (sms = [], message = '') => {
    if (!Array.isArray(sms)) {
        sms = [sms];
    }
    sms.forEach(singleSMS => {
        // console.log('REVE SMS IN LOOP ', singleSMS);
        sendSmsROBI(singleSMS.to || singleSMS, singleSMS.text || message);
    });
    return true;
};

const sendSms = async (to, message) => {
    try {
        const gateway = await dao.gateway.getSmsGateway();
        console.log("SMS GATEWAY FROM REDIS ", gateway);
        if (gateway === constants.smsGateway.REVE) {
            const response = await sendSmsREVE(to, message);
            return response;
        } else if (gateway === constants.smsGateway.METRO) {
            const response = await sendBulkMetroSms(to, message);
            return response;
        } else if (gateway === constants.smsGateway.ROBI) {
            const response = await sendSmsROBI(to, message);
            return response;
        }
        const response = await sendSmsInfobip(to, message);
        return response;
    } catch (err) {
        return Promise.reject(err);
    }
};

const sendBulkSms = async (sms = [], message = '') => {
    const gateway = await dao.gateway.getSmsGateway() || 'reve';
    console.log("BULK SMS GATEWAY FROM REDIS ", gateway);
    if (gateway === constants.smsGateway.REVE) {
        const response = await sendBulkReveSms(sms, message);
        return response;
    } else if (gateway === constants.smsGateway.METRO) {
        const response = await sendBulkMetroSms(sms, message);
        return response;
    } else if (gateway === constants.smsGateway.ROBI) {
        const response = await sendBulkRobiSms(sms, message);
        return response;
    }
    const response = await sendBulkInfobipSms(sms, message);
    return response;
};

module.exports = {
    notifyUser,
    notifyUsers,
    notifyGroupStudent,
    sendFileGeneratedNotification,
    sendBulkSms,
    sendSms,
};
