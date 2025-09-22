const constants = require('../constants');

const isAdmin = (req) => !req.user.roles.includes(constants.student.roles.STUDENT);

const isEnrolledInCourse = (req, res, next) => {
  if (isAdmin(req)) {
    next();
    return;
  }
  if (req.user.courses.includes(req.params.courseId)) {
    next();
    return;
  }
  res.forbidden({ title: 'You are not enrolled in this course' });
};
const isAuthorizedToGroup = (req, res, next) => {
  if (isAdmin(req)) {
    next();
    return;
  }
  const { groups } = req.user;
  if (groups.includes(req.params.groupId)) {
    next();
    return;
  }
  res.forbidden({ title: 'You are not authorized to this group' });
};
module.exports = {
  isEnrolledInCourse,
  isAuthorizedToGroup,
};
