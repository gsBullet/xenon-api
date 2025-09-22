const cron = require('node-cron');
const { autoSubmitHandle } = require('../exam');

const init = () => {
  cron.schedule('* * * * *', async () => {
    autoSubmitHandle();
  });
};
module.exports = { init };
