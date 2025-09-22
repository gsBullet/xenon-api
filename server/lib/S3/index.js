const aws = require("aws-sdk");
const mime = require("mime");
const Promise = require("bluebird");
const config = require("../../config");
const utils = require("../utils");

const partSize = 50 * 1024 * 1024; // 15MB
const s3 = new aws.S3({ apiVersion: "2006-03-01", signatureVersion: "v4" });
const { bucket, userFilesDirectory, transcodedBucket, transcodedDirectory } =
  config.s3;
const signGetRequest = async (key) => {
  const params = {
    Bucket: bucket,
    Key: key,
    Expires: config.s3.signedUrlTTL,
  };
  const signUrl = Promise.promisify(s3.getSignedUrl, { context: s3 });
  const signedUrl = await signUrl("getObject", params);
  return signedUrl;
};

const signDownloadVideoRequest = async (key) => {
  const params = {
    Bucket: transcodedBucket,
    Key: key,
    Expires: config.s3.signedUrlTTL,
  };
  const signUrl = Promise.promisify(s3.getSignedUrl, { context: s3 });
  const signedUrl = await signUrl("getObject", params);
  return signedUrl;
};

const completeMultipartUpload = async (uploadId, multipartMap, key) => {
  console.log("Completing multipart upload:", uploadId, multipartMap, key);
  const params = {
    Bucket: transcodedBucket,
    Key: key,
    MultipartUpload: {
      Parts: multipartMap,
    },
    UploadId: uploadId,
  };

  try {
    const data = await s3.completeMultipartUpload(params).promise();
    console.log("Multipart upload completed:", data);
    return data;
  } catch (err) {
    console.error("Error completing multipart upload:", err);
    throw err;
  }
};

const createMultipartUpload = async (mimeType) => {
  const extension = mime.getExtension(mimeType);
  const fileName = await utils.randomNumericString(12);
  const key = `${transcodedDirectory}/${fileName}/${fileName}.${extension}`;
  const s3Bucket = transcodedBucket;

  const params = {
    Bucket: s3Bucket,
    Key: key,
  };

  try {
    const data = await s3.createMultipartUpload(params).promise();
    console.log("Multipart upload created:", data);
    return {
      key,
      uploadId: data.UploadId,
    };
  } catch (err) {
    console.error("Error creating multipart upload:", err);
    throw err;
  }
};

const generateSignedUrls = async (uploadId, fileSize, key) => {
  const numParts = Math.ceil(fileSize / partSize);
  const signedUrls = [];

  for (let partNumber = 1; partNumber <= numParts; partNumber++) {
    const params = {
      Bucket: transcodedBucket,
      Key: key,
      PartNumber: partNumber,
      UploadId: uploadId,
      Expires: 60 * 60 * 6, // URL expiration time in seconds (5 minutes)
    };

    const signedUrl = s3.getSignedUrl("uploadPart", params);
    signedUrls.push({ signedUrl, partNumber });
  }

  return signedUrls;
};

const getFileInfo = async (fileKey) => {
  const headObject = Promise.promisify(s3.headObject, { context: s3 });
  const params = {
    Bucket: bucket,
    Key: fileKey,
  };
  try {
    const fileInfo = await headObject(params);
    return fileInfo;
  } catch (err) {
    if (err.statusCode === 404) return null;
    return Promise.reject(err);
  }
};

const verifyFileInfo = async (info) => {
  const fileInfo = await getFileInfo(info.key);
  if (!fileInfo) return false;
  if (
    fileInfo.ContentType !== info.mimeType ||
    fileInfo.ContentLength !== info.size
  ) {
    return false;
  }
  return true;
};
const getSignedRequest = async (mimeType) => {
  console.log("Getting signed request for:", mimeType.replace(/['"]/g, ""));
  const extension = mime.getExtension(mimeType.replace(/['"]/g, ""));
  const fileName = await utils.randomNumericString(12);
  let key = `${userFilesDirectory}/${fileName}.${extension}`;
  let s3Bucket = bucket;
  let acl = "public-read";
  //if mimeType video key = lectureVideos
  //if mimeType image key = lectureImages
  //if mimeType pdf key = lecturePdfs

  if (mimeType.includes("video")) {
    key = `${transcodedDirectory}/${fileName}/${fileName}.${extension}`;
    s3Bucket = transcodedBucket;
    acl = undefined;
  }

  const params = {
    Bucket: s3Bucket,
    Key: key,
    Expires: config.s3.signedUrlTTL,
    ContentType: mimeType,
    ACL: acl,
  };

  const signUrl = Promise.promisify(s3.getSignedUrl, { context: s3 });
  const signedUrl = await signUrl("putObject", params);
  return {
    key,
    signedUrl,
  };
};

module.exports = {
  signGetRequest,
  verifyFileInfo,
  getFileInfo,
  getSignedRequest,
  signDownloadVideoRequest,
  createMultipartUpload,
  generateSignedUrls,
  completeMultipartUpload,
};
