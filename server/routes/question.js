const express = require('express');
const questionController = require('../controllers/question');
const auth = require('../middleware/auth');
const questionValidator = require('../middleware/request/validator/question');

const router = express.Router();

router.post(
  '/',
  auth.isLoggedIn,
  auth.authorizeQuestionUploader,
  questionValidator.create,
  questionController.create,
);
router.get(
  '/by-id/:id', // ? id => questionId
  auth.isLoggedIn,
  auth.authorizeQUEM,
  questionController.getById,
);
router.get(
  '/search',
  auth.isLoggedIn,
  auth.authorizeQUEM,
  questionController.search,
);
router.get(
  '/export',
  auth.isLoggedIn,
  auth.authorizeQUEM,
  questionController.exportCSV,
);
router.patch(
  '/update/:id', // ? id => questionId
  auth.isLoggedIn,
  auth.authorizeQUEM,
  questionValidator.update,
  questionController.updateById,
);
router.patch(
  '/delete/:id',
  auth.isLoggedIn,
  auth.authorizeQUEM,
  questionController.removeById,
);
module.exports = router;
