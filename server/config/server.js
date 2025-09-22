const { formatEnv } = require('../lib/utils');

const vars = formatEnv([
  { name: 'NODE_ENV' },
  { name: 'SERVER_PLATFORM_NAME', defaultValue: 'Xenon' },
  { name: 'SERVER_HOST', defaultValue: 'localhost' },
  { name: 'SERVER_PORT', type: 'numbver', defaultValue: 'localhost' },
  { name: 'SERVER_APP_LINK' },
]);

module.exports = {
  platformName: vars.SERVER_PLATFORM_NAME,
  host: vars.SERVER_HOST,
  port: vars.SERVER_PORT,
  appLink: vars.SERVER_APP_LINK,
};
