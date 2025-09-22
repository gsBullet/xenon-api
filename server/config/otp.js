const { formatEnv } = require('../lib/utils');

const vars = formatEnv([
  { name: 'OTP_LENGTH', type: 'number', defaultValue: 6 },
  { name: 'OTP_SECRET' },
  { name: 'OTP_TTL', type: 'number', defaultValue: 5 * 60 * 1000 },
]);

module.exports = {
  secret: vars.OTP_SECRET,
  TTL: vars.OTP_TTL,
  length: vars.OTP_LENGTH,
};
