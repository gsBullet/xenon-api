const AWS = require('aws-sdk');
const config = require('../../config');

AWS.config.update({ region: config.ses.region });
let ses = null;

const getSES = () => {
  if (!ses) {
    ses = new AWS.SES({
      accessKeyId: config.ses.accessKeyId,
      secretAccessKey: config.ses.secretAccessKey,
      region: config.ses.region,
    });
  }
  return ses;
};
module.exports = getSES;
