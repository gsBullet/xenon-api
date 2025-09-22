const express = require('express');
const subjectController = require('../controllers/subject');
const auth = require('../middleware/auth');
const student = require('../middleware/student');
const subjectValidator = require('../middleware/request/validator/subject');

const router = express.Router();

router.post(
  '/',
  auth.isLoggedIn,
  auth.authorizeModerator,
  subjectValidator.create,
  subjectController.create,
);
router.patch(
  '/:subjectId/reorder/lecture-chapter',
  auth.isLoggedIn,
  auth.authorizeModerator,
  subjectValidator.reorder,
  subjectController.reorder,
);
router.get(
  '/:subjectId',
  auth.isLoggedIn,
  // auth.authorizeModerator,
  subjectController.getById,
);
router.delete(
  '/:id',
  auth.isLoggedIn,
  auth.authorizeModerator,
  subjectController.deleteSubjectById,
);
router.patch(
  '/:id',
  auth.isLoggedIn,
  auth.authorizeModerator,
  subjectValidator.update,
  subjectController.updateSubjectById,
);
router.get(
  '/by-course-id/:courseId',
  auth.isLoggedIn,
  student.isEnrolledInCourse,
  subjectController.getSubjectsByCourseId,
);
router.post(
  '/start/',
  auth.isLoggedIn,
  auth.isStudent,
  subjectValidator.start,
  subjectController.start,
);
module.exports = router;
