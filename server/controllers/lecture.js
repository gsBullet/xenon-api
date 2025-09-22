const jwt = require('jsonwebtoken');
const constants = require('../constants');
const dao = require('../data');
const { notifyUsers } = require('../lib/notification');
const utils = require('../lib/utils');

module.exports = {
  create: async (req, res) => {
    try {
      const lecture = await dao.lecture.create(req.body);
      res.ok(lecture);
    } catch (err) {
      const isDuplicateErr = utils.isDuplicateDocument(err.message);
      if (isDuplicateErr) {
        res.conflict({ title: 'Lecture name already exist' });
        return;
      }
      res.serverError(err);
    }
  },
  lectureById: async (req, res) => {
    try {
      const isStudent = req.user.roles.includes(constants.student.roles.STUDENT);
      console.log('isStudent', isStudent);
      const lecture = await dao.lecture.getById(req.params.id, isStudent);
      
      if (!lecture) {
        res.notFound({ title: 'Lecture not found' });
        return;
      }
      res.ok(lecture);
    } catch (err) {
      res.serverError(err);
    }
  },
  lecturesBySubjectId: async (req, res) => {
    try {
     
      const lectures = await dao.lecture.getLecturesBySubjectId(req.params.subjectId);
      res.ok(lectures);
    } catch (err) {
      res.serverError(err);
    }
  },
  getTokenForVod: async (req, res) => {
    try {
      const { key } = req.body;
      console.log('key', key);
      const content = await dao.content.findDurationByURL(key);
      if (!content) {
        res.notFound({ title: 'Content not found' });
        return;
      }
      const duration = 11000;
      console.log('key', key.split('/')[1].split('.')[0]);
      console.log('process.env.VOD_ACCESS_TOKEN_SECRET', process.env.VOD_ACCESS_TOKEN_SECRET);
      const accessToken = jwt.sign({
        key: key.split('/')[1].split('.')[0],
      }, process.env.VOD_ACCESS_TOKEN_SECRET, {
        expiresIn: `${duration}ms`,
      });

      //add access token as httpOnly cookie
      // res.cookie('accesstoken', accessToken, {
      //   maxAge: duration * 1000,
      //   sameSite: 'None',
      // });

      // const refreshToken = jwt.sign({
      //   key,
      // }, process.env.VOD_REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
      res.ok({ accessToken, duration });
    } catch (err) {
      res.serverError(err);
    }
  },

  getDecryptionKey: async (req, res) => {
    try {
      const { key } = req.params;
      const content = await dao.content.findEncKeyByURL(key);
      res.ok({ key: content.encKey });
    } catch (err) {
      res.serverError(err);
    }
  },

  verifyVODAccess: async (req, res) => {
    try {
      const { accessToken, apiKey } = req.body;
      if (apiKey !== process.env.API_KEY) {
        res.forbidden({ title: 'Invalid API Key' });
        return;
      }
      jwt.verify(accessToken, process.env.VOD_ACCESS_TOKEN_SECRET);
      res.ok({ valid: true });
    } catch (err) {
      res.ok({ valid: false });
    }
  },
  // getAccessToken: async (req, res) => {
  //   try {
  //     const { refreshToken } = req.body;
  //     const { key } = jwt.verify(refreshToken, process.env.VOD_REFRESH_TOKEN_SECRET);
  //     const accessToken = jwt.sign({
  //       key,
  //     }, process.env.VOD_ACCESS_TOKEN_SECRET, {
  //       expiresIn: '60m',
  //     });
  //     res.ok({ accessToken });
  //   } catch (err) {
  //     res.serverError(err);
  //   }
  // },

  updateContentsById: async (req, res) => { // contents order
    const { id } = req.params;
    try {
      const lecture = await dao.lecture.updateContents(id, req.body);
      if (!lecture) {
        res.notFound({ title: 'Lecture not found' });
        return;
      }
      res.ok(lecture);
    } catch (err) {
      res.serverError(err);
    }
  },
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { lecture } = await dao.lecture.update(id, req.body);
      if (!lecture) {
        res.notFound({ title: 'Lecture not found' });
        return;
      }
      res.ok(lecture);
    } catch (err) {
      res.serverError(err);
    }
  },
  detete: async (req, res) => {
    try {
      const { id } = req.params;
      const { lecture } = await dao.lecture.delete(id);
      if (!lecture) {
        res.notFound({ title: 'Lecture not found' });
        return;
      }
      res.ok(lecture);
    } catch (err) {
      res.serverError(err);
    }
  },
  addAccessToGroup: async (req, res) => {
    try {
      const { groupId, lectureId } = req.params;
      const lecture = await dao.lecture.getById(lectureId);
      if (!lecture) {
        res.notFound({ title: 'Lecture not found' });
        return;
      }
      const group = await dao.group.addLectureAccess(groupId, lectureId);
      if (!group) {
        res.notFound({ title: 'Group not found' });
        return;
      }
      const students = await dao.student.studentsByGroupId(groupId);
      if (students) {
        const studentList = students.map((s) => s.username);
        const { notification } = await dao.notification.create({
          students: studentList,
          message: `One lecture have been added to group ${group.name}`,
          type: constants.notification.type.NOTIFICATION,
          info: {
            action: constants.notification.action.ADDED,
            on: 'lecture',
            id: lectureId,
            courseId: group.courseId,
            subjectId: lecture.subjectId,
          },
        });
        notifyUsers(studentList, notification);
      }
      res.ok(group);
    } catch (err) {
      res.serverError(err);
    }
  },
  removeContents: async (req, res) => {
    try {
      const { lectureId } = req.params;
      const lecture = await dao.lecture.removeContents(lectureId, req.body);
      if (!lecture) {
        res.notFound({ title: 'Lecture not found' });
        return;
      }
      res.ok(lecture);
    } catch (err) {
      res.serverError(err);
    }
  },
};
