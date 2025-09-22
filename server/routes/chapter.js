const express = require('express');
const chapterController = require('../controllers/chapter');
const auth = require('../middleware/auth');
const chapterValidator = require('../middleware/request/validator/chapter');

const router = express.Router();
router.post(
  '/',
  auth.isLoggedIn,
  auth.authorizeModerator,
  chapterValidator.create,
  chapterController.create,
);
router.get(
  '/:id',
  auth.isLoggedIn,
  chapterController.getById,
);
router.get(
  '/by-subject-id/:subjectId',
  auth.isLoggedIn,
  chapterController.chaptersBySubjectId,
);
router.patch(
  '/:id/content-order',
  auth.isLoggedIn,
  auth.authorizeModerator,
  chapterValidator.removeUpdateContents,
  chapterController.updateContentsById,
);
router.patch(
  '/:groupId/add-access/:chapterId',
  auth.isLoggedIn,
  auth.authorizeModerator,
  chapterController.addAccessToGroup,
);
router.patch(
  '/:id/update',
  auth.isLoggedIn,
  auth.authorizeModerator,
  chapterValidator.update,
  chapterController.update,
);
router.delete(
  '/:id/delete',
  auth.isLoggedIn,
  auth.authorizeModerator,
  chapterController.delete,
);
router.patch(
  '/:chapterId/remove-content',
  auth.authorizeModerator,
  auth.isLoggedIn,
  chapterValidator.removeUpdateContents,
  chapterController.removeContents,
);
module.exports = router;
