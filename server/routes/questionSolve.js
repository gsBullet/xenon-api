const express = require('express');
const questionSolveController = require('../controllers/questionSolve');
const validator = require('../middleware/request/validator/questionSolve');
const auth = require('../middleware/auth');

const router = express.Router();
router.post(
  '/',
  auth.isLoggedIn,
  auth.authorizeModerator,
  validator.create,
  questionSolveController.create,
);
router.get(
  '/:id',
  auth.isLoggedIn,
  questionSolveController.getById,
);
router.get(
  '/by-subject-id/:subjectId',
  auth.isLoggedIn,
  questionSolveController.bySubjectId,
);
router.patch(
  '/:id/content-order',
  auth.isLoggedIn,
  auth.authorizeModerator,
  validator.removeUpdateContents,
  questionSolveController.updateContentsById,
);
router.patch(
  '/:groupId/add-access/:questionSolveId',
  auth.isLoggedIn,
  auth.authorizeModerator,
  questionSolveController.addAccessToGroup,
);
router.patch(
  '/:id/update',
  auth.isLoggedIn,
  auth.authorizeModerator,
  validator.update,
  questionSolveController.update,
);
router.delete(
  '/:id/delete',
  auth.isLoggedIn,
  auth.authorizeModerator,
  questionSolveController.delete,
);
router.patch(
  '/:questionSolveId/remove-content',
  auth.authorizeModerator,
  auth.isLoggedIn,
  validator.removeUpdateContents,
  questionSolveController.removeContents,
);
module.exports = router;
