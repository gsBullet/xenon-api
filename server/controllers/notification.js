const notificationSender = require('../lib/notification');
const dao = require('../data');

module.exports = {
  create: async (req, res) => {
    try {
      const { students, sms, message, sendToGuardian } = req.body;
      console.log('SMS ON students-->',students, 'sms-->', sms ,'message-->', message);
      if (students) {
        const createNotification = await dao.notification.create(req.body);
        notificationSender.notifyUsers(students, createNotification.notification);
      }
      if (sms) {
        await notificationSender.sendBulkSms(sms, message);
      }
      if (sendToGuardian) {
        const studentProfile = await dao.student.getByUsernames(students);
        const contactList = studentProfile.map((student) => student.contact);
        console.log('contactList-->', contactList);
        await notificationSender.sendBulkSms(contactList, message);
      }
      res.ok({ done: 'ok' });
      return;
    } catch (err) {
      res.serverError(err);
    }
  },
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await dao.notification.getById(id);
      res.ok(notification);
    } catch (err) {
      res.serverError(err);
    }
  },
  deleteNotificationFromStudent: async (req, res) => {
    try {
      const { nid } = req.params;
      const { id: sid } = req.user;
      const student = await dao.notification.deleteNotificationFromStudentProfile(sid, nid);
      res.ok(student);
    } catch (err) {
      console.log(err);
      res.serverError(err);
    }
  },
  seenHandle: async (req, res) => {
    try {
      const { id: studentId } = req.user;
      const { id } = req.params;
      const student = await dao.student.notificationSeenUpdate(studentId, id);
      if (!student) {
        res.notFound({ title: 'No notification found' });
        return;
      }
      res.ok({ isSeen: true });
    } catch (err) {
      res.serverError(err);
    }
  },
};
