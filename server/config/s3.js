const { formatEnv } = require('../lib/utils');
// S3_TRANSCODED_BUCKET=retina-transcoded
// S3_TRANSCODE_DIRECTORY=source
const vars = formatEnv([
  { name: 'AWS_ACCESS_KEY_ID' },
  { name: 'AWS_SECRET_ACCESS_KEY' },
  { name: 'S3_BUCKET' },
  { name: 'S3_SINGNED_URL_TTL', type: 'number', defaultValue: 300 },
  { name: 'S3_USER_FILES_DIRECTORY' },
  { name: 'S3_TRANSCODED_BUCKET' },
  { name: 'S3_TRANSCODE_DIRECTORY' },

]);

module.exports = {
  bucket: vars.S3_BUCKET,
  signedUrlTTL: vars.S3_SINGNED_URL_TTL, // seconds
  userFilesDirectory: vars.S3_USER_FILES_DIRECTORY,
  transcodedBucket: vars.S3_TRANSCODED_BUCKET,
  transcodedDirectory: vars.S3_TRANSCODE_DIRECTORY,
};
