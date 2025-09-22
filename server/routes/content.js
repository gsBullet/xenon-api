const express = require("express");
const contentController = require("../controllers/content");
const auth = require("../middleware/auth");
const contentValidator = require("../middleware/request/validator/content");

const router = express.Router();

router.post(
  "/",
  auth.isLoggedIn,
  auth.authorizeContentUploader,
  contentValidator.create,
  contentController.create
);

router.get("/updateStatus", contentController.updateStatus);

router.post("/updateStatus", contentController.updateStatusPost);

router.post("/drm-auth", auth.isLoggedIn, contentController.drmAuth);
router.get("/test", contentController.test);

router.get(
  "/search",
  auth.isLoggedIn,
  auth.authorizeContentUploader,
  contentController.search
);

router.delete(
  "/delete/:id",
  auth.isLoggedIn,
  auth.authorizeContentUploader,
  contentController.delete
);

router.patch(
  "/update/:id",
  auth.isLoggedIn,
  auth.authorizeContentUploader,
  contentValidator.update,
  contentController.update
);

router.patch(
  "/publish/:id",
  auth.isLoggedIn,
  auth.authorizeContentUploader,
  contentController.publishContentById
);

router.get(
  "/signed-request",
  auth.isLoggedIn,
  contentController.signedKeyRequest
);

router.post(
  "/download-link",
  auth.isLoggedIn,
  contentController.getSignedRequest
);

router.get(
  "/create-sign-multipart-upload",
  auth.isLoggedIn,
  contentController.createSignMultipartUpload
);

router.post(
  "/complete-multipart-upload",
  auth.isLoggedIn,
  contentController.completeMultipartUpload
);

router.post(
  "/generate-signed-urls",
  auth.isLoggedIn,
  contentController.generateSignedUrls
);

router.patch(
  "/add-access/:id",
  auth.isLoggedIn,
  auth.authorizeContentUploader,
  contentValidator.addAccess,
  contentController.addAccess
);
router.patch(
  "/mark-as-complete/:id",
  auth.isLoggedIn,
  auth.isStudent,
  contentValidator.markAsComplete,
  contentController.markAsComplete
);
module.exports = router;
