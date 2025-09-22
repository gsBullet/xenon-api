const { formatEnv } = require('../lib/utils');

const vars = formatEnv([
  { name: 'INFOBIP_SMS_API_KEY' },
  { name: 'METRO_SMS_API_KEY' },
  { name: 'REVE_SMS_API_KEY' },
  { name: 'REVE_SMS_SECRET_KEY' },
  { name: 'INFOBIP_SMS_FROM' },
  { name: 'METRO_SMS_FROM' },
  { name: 'REVE_SMS_FROM' },
  { name: 'ROBI_SMS_USERNAME' },
  { name: 'ROBI_SMS_PASSWORD' },
  { name: 'ROBI_SMS_FROM' },
  { name: 'DEFAULT_SMS_GATEWAY' },
]);

module.exports = {
  infobipSmsApiKey: vars.INFOBIP_SMS_API_KEY,
  metroSmsApiKey: vars.METRO_SMS_API_KEY,
  reveSmsApiKey: vars.REVE_SMS_API_KEY,
  reveSmsSecretKey: vars.REVE_SMS_SECRET_KEY,
  infobipSmsFrom: vars.INFOBIP_SMS_FROM,
  metroSmsFrom: vars.METRO_SMS_FROM,
  reveSmsFrom: vars.REVE_SMS_FROM,
  robiSmsUsername: vars.ROBI_SMS_USERNAME,
  robiSmsPassword: vars.ROBI_SMS_PASSWORD,
  robiSmsFrom: vars.ROBI_SMS_FROM,
  defaultSmsGateway: vars.DEFAULT_SMS_GATEWAY,
};
