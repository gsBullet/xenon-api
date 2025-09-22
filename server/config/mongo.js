const { formatEnv } = require('../lib/utils');

const vars = formatEnv([
  { name: 'MONGODB_URL' },
  { name: 'MONGODB_POOL_SIZE', type: 'number', defaultValue: 5 },
]);

module.exports = {
  mongodbURL: vars.MONGODB_URL,
  mongodbPoolSize: vars.MONGODB_POOL_SIZE,
};
