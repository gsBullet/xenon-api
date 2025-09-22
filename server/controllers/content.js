const dao = require("../data");
const S3 = require("../lib/S3");
const utils = require("../lib/utils");

module.exports = {
  signedKeyRequest: async (req, res) => {
    try {
      const { mimeType } = req.query;

      const signedRequest = await S3.getSignedRequest(
        decodeURIComponent(mimeType)
      );
      res.ok(signedRequest);
    } catch (err) {
      res.serverError(err);
    }
  },
  getSignedRequest: async (req, res) => {
    try {
      const { key } = req.body;
      const signedRequest = await S3.signDownloadVideoRequest(key);
      res.ok({
        downloadLink: signedRequest,
      });
    } catch (err) {
      res.serverError(err);
    }
  },
  createSignMultipartUpload: async (req, res) => {
    try {
      const { mimeType } = req.query;
      const { key, uploadId } = await S3.createMultipartUpload(mimeType);
      res.ok({ key, uploadId });
    } catch (err) {
      res.serverError(err);
    }
  },

  completeMultipartUpload: async (req, res) => {
    try {
      const { key, uploadId, parts } = req.body;
      const data = await S3.completeMultipartUpload(uploadId, parts, key);
      res.ok(data);
    } catch (err) {
      res.serverError(err);
    }
  },

  generateSignedUrls: async (req, res) => {
    try {
      const { key, uploadId, fileSize } = req.body;
      const signedUrls = await S3.generateSignedUrls(uploadId, fileSize, key);
      res.ok(signedUrls);
    } catch (err) {
      res.serverError(err);
    }
  },

  create: async (req, res) => {
    try {
      const createdBy = req.user.id;
      const content = await dao.content.create({ ...req.body, createdBy });
      res.ok(content);
    } catch (err) {
      const isDuplicateErr = utils.isDuplicateDocument(err.message);
      if (isDuplicateErr) {
        res.conflict({ title: "Content name already added" });
        return;
      }
      res.serverError(err);
    }
  },
  updateStatus: async (req, res) => {
    try {
      const { status, id, key } = req.query;
      // const { status } = req.body;
      if (process.env.API_KEY !== key) {
        res.forbidden({ title: "Invalid API Key" });
        return;
      }

      const content = await dao.content.updateStatus(id, status === "COMPLETE");
      // const content = await updateStatus(id, status);
      if (!content) {
        res.notFound({ title: "Content not found" });
        return;
      }
      console.log("updateStatus Request Received", content);
      res.ok(content);
    } catch (err) {
      res.serverError(err);
    }
  },
  test: async (req, res) => {
    try {
      res.ok({ message: "Test Success" });
    } catch (err) {
      res.serverError(err);
    }
  },
  updateStatusPost: async (req, res) => {
    try {
      const { status, id, key, playlist, output_details, encVersion } =
        req.body;
      console.log(
        "Cloudfront response updateStatusPost Request Received",
        req.body
      );
      let url = "";
      let duration = 0;
      if (output_details && output_details.length > 0) {
        duration = output_details[0].durationInMs;
      }
      if (process.env.API_KEY !== key) {
        res.forbidden({ title: "Invalid API Key" });
        return;
      }

      if (playlist) {
        const parts = playlist.split("/");
        url = parts.slice(3).join("/");
      }

      const content = await dao.content.updateStatus(
        id,
        url,
        duration,
        status === "COMPLETE",
        encVersion
      );

      console.log("updateStatus Request Processed", content);
      res.ok(content);
    } catch (err) {
      res.serverError(err);
    }
  },

  drmAuth: async (req, res) => {
    try {
      const { userId, contentId, platform } = req.body;
      const drmAuthUri = process.env.DRM_AUTH_URI;
      const authKey = process.env.DRM_AUTH_SECRET;
      //fetch request to DRM_AUTH_URI
      const response = await fetch(drmAuthUri, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          contentId,
          platform,
          authKey,
        }),
      });

      console.log("DRM Auth Response", response);

      const data = await response.json();
      res.ok(data);
    } catch (err) {
      console.log("DRM Auth Error", err);
      res.serverError(err);
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const content = await dao.content.deleteContent(id);
      if (!content) {
        res.notFound({ title: "Content not found" });
        return;
      }
      res.ok(content);
    } catch (err) {
      res.serverError(err);
    }
  },
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const content = await dao.content.updateContentById(id, req.body);
      if (!content) {
        res.notFound({ title: "Content not found" });
        return;
      }
      res.ok(content);
    } catch (err) {
      const isDuplicateErr = utils.isDuplicateDocument(err.message);
      if (isDuplicateErr) {
        res.conflict({ title: "Content name already exist" });
        return;
      }
      res.serverError(err);
    }
  },
  publishContentById: async (req, res) => {
    try {
      const { id } = req.params;
      const content = await dao.content.publishContentById(
        id,
        req.body.publish
      );
      if (!content) {
        res.notFound({ title: "Content not found" });
        return;
      }
      res.ok(content);
    } catch (err) {
      res.serverError(err);
    }
  },
  search: async (req, res) => {
    try {
      const {
        title,
        subjectId,
        courseId,
        lectureId,
        chapterId,
        startDate,
        endDate,
      } = req.query;
      const options = {
        title,
        subjectId,
        courseId,
        lectureId,
        chapterId,
        startDate,
        endDate,
      };
      const contents = await dao.content.searchContent(options);
      res.ok(contents);
    } catch (err) {
      res.serverError(err);
    }
  },
  addAccess: async (req, res) => {
    try {
      const { id } = req.params;
      const content = await dao.content.getById(id);
      if (!content) {
        res.notFound({ title: "Content not found" });
        return;
      }
      const { lecture, chapter, questionSolve } = await dao.content.addAccess(
        content,
        req.body
      );
      if (!lecture || !chapter || !questionSolve) {
        if (!questionSolve) {
          res.notFound({ title: "Question solution not found" });
          return;
        }
        const body = lecture ? "Chapter" : "Lecture";
        res.notFound({ title: `${body} not found` });
        return;
      }
    } catch (err) {
      res.serverError(err);
    }
  },
  markAsComplete: async (req, res) => {
    try {
      const {
        body,
        user: { id: studentId },
        params: { id },
      } = req;
      const completion = await dao.completion.markAsComplete({
        id,
        studentId,
        ...body,
      });
      if (!completion) {
        res.notFound({ title: "Subject or content not found" });
        return;
      }
      res.ok(completion);
    } catch (err) {
      res.serverError(err);
    }
  },
};
