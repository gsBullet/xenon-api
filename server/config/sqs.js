const { formatEnv } = require('../lib/utils');

const vars = formatEnv([
  { name: 'SQS_ACCESS_KEY_ID' },
  { name: 'SQS_SECRET_ACCESS_KEY' },
  { name: 'SQS_REGION' },
  { name: 'SQS_QUEUE_ENDPOINT' },
]);

module.exports = {
  accessKeyId: vars.SES_ACCESS_KEY_ID,
  secretAccessKey: vars.SES_SECRET_ACCESS_KEY,
  region: vars.SES_REGION,
  queueUrl: vars.SQS_QUEUE_ENDPOINT,
};
