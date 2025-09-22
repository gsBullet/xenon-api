/* eslint-disable no-underscore-dangle */
const { ObjectId } = require('mongoose').Types;
const mongoose = require('mongoose');
const Notification = require('../../../models/Notification');
const Student = require('../../../models/Student');

module.exports = {
  create: async ({
    students, message, info, type,
  }) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const notification = await new Notification({ message, info, type })
        .save({ session });

      const notificationObj = {
        isSeen: false,
        notificationId: notification._id,
      };
      let query = { _id: { $in: students } };
      let isUsername = false;
      for (let i = 0; i < students.length; i += 1) {
        if (!ObjectId.isValid(students[i])) isUsername = true; break;
      }
      if (isUsername) {
        query = { username: { $in: students } };
      }
      const user = await Student.updateMany(
        { ...query },
        {
          $push: {
            notifications: {
              $each: [notificationObj],
              $position: 0,
              $slice: 30,
            },
          },
        },
        { multi: true, new: true },
      ).session(session);
      await session.commitTransaction();
      return { notification, user };
    } catch (err) {
      await session.abortTransaction();
      return Promise.reject(err);
    } finally {
      await session.endSession();
    }
  },
  getById: async (id) => {
    const notification = await Notification.findOne({ _id: id });
    return notification;
  },
  deleteNotificationFromStudentProfile: async (studentId, notificationId) => {
    const student = await Student.findOneAndUpdate({ _id: studentId },
      { $pull: { notifications: { notificationId } } },
      { new: true });
    return student;
  },
};
