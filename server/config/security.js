const { formatEnv } = require('../lib/utils');

const vars = formatEnv([
  { name: 'SECURITY_SECRET' },
  { name: 'ENCRYPTION_SECRET' },
  { name: 'SECURITY_SALT_ROUNDS', type: 'number', defaultValue: 12 },
]);

module.exports = {
  secret: vars.SECURITY_SECRET,
  saltRounds: vars.SECURITY_SALT_ROUNDS,
  encryptionKey: vars.ENCRYPTION_SECRET,
};
