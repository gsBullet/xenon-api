const { formatEnv } = require('../lib/utils');

const vars = formatEnv([
  { name: 'SES_ACCESS_KEY_ID' },
  { name: 'SES_SECRET_ACCESS_KEY' },
  { name: 'SES_REGION' },
  { name: 'SES_FROM_EMAIL' },
]);

module.exports = {
  accessKeyId: vars.SES_ACCESS_KEY_ID,
  secretAccessKey: vars.SES_SECRET_ACCESS_KEY,
  region: vars.SES_REGION,
  fromEmail: vars.SES_FROM_EMAIL,
};
