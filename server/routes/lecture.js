const express = require('express');
const lectureController = require('../controllers/lecture');
const auth = require('../middleware/auth');
const lectureValidator = require('../middleware/request/validator/lecture');

const router = express.Router();

router.post(
  '/',
  auth.isLoggedIn,
  auth.authorizeModerator,
  lectureValidator.create,
  lectureController.create,
);

router.get(
  '/:id', // lectureId
  auth.isLoggedIn,
  lectureController.lectureById,
);

router.post(
  '/getToken',
  auth.isLoggedIn,
  lectureController.getTokenForVod,
);

router.get(
  '/get-key/:key',
  auth.isLoggedIn,
  lectureController.getDecryptionKey,
);

// router.get(
//   '/getRefreshToken/:key',
//   auth.isLoggedIn,
//   lectureController.getAccessToken,
// );

router.post('/verify',
  lectureController.verifyVODAccess);

router.get(
  '/by-subject-id/:subjectId',
  auth.isLoggedIn,
  lectureController.lecturesBySubjectId,
);

router.patch(
  '/:id/content-order',
  auth.isLoggedIn,
  auth.authorizeModerator,
  lectureValidator.removeUpdateContents,
  lectureController.updateContentsById,
);
router.patch(
  '/:id/update',
  auth.isLoggedIn,
  auth.authorizeModerator,
  lectureValidator.update,
  lectureController.update,
);
router.delete(
  '/:id/delete',
  auth.isLoggedIn,
  auth.authorizeModerator,
  lectureController.detete,
);
router.patch(
  '/:groupId/add-access/:lectureId',
  auth.authorizeModerator,
  auth.isLoggedIn,
  lectureController.addAccessToGroup,
);
router.patch(
  '/:lectureId/remove-content',
  auth.authorizeModerator,
  auth.isLoggedIn,
  lectureValidator.removeUpdateContents,
  lectureController.removeContents,
);
module.exports = router;
