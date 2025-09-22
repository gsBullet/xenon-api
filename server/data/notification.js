const notificationMongoImpl = require('./impl/mongo/notification');

module.exports = {
  create: async ({
    students, message, info, type,
  }) => notificationMongoImpl
    .create({
      students, message, info, type,
    }),
  getById: async (id) => notificationMongoImpl.getById(id),
  deleteNotificationFromStudentProfile: async (sid, nid) => notificationMongoImpl
    .deleteNotificationFromStudentProfile(sid, nid),
};
