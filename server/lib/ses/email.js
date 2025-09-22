/* eslint-disable no-loop-func */
const SESClient = require('./index');

const ses = SESClient();

const formatEmailAndSend = async (emails) => {
  for (let i = 0; i < emails.length; i += 10) {
    const requests = emails.slice(i, i + 10).map((data) => {
      const params = {
        Destination: { /* required */
          ToAddresses: Array.isArray(data.to) ? [...data.to] : [data.to],
        },
        Message: { /* required */
          Body: { /* required */
            Html: {
              Charset: 'UTF-8',
              Data: data.html,
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: data.subject,
          },
        },
        Source: data.from, /* required */
      };
      console.log('Sending email to ', data.to);
      return ses.sendEmail(params).promise()
        .catch((err) => {
          console.log(err);
        });
    });
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(requests)
      .catch((e) => console.log(`Error in sending email for the batch ${i} - ${e}`));
  }
};
/**
 * @async
 * @param {Object<Array>} to array of emails
 * @param {Object} html body of email in HTML
 * @param {Object} subject subject of email in HTML
 * @param {Object<Array>} from email
 * @returns{Promise<null>} null
 */
const sendEmail = async (data) => {
  if (Array.isArray(data)) {
    await formatEmailAndSend(data);
  } else {
    await formatEmailAndSend([data]);
  }
};
module.exports = { sendEmail };
