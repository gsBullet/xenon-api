const mongo = require('../server/lib/mongoose');
const Redis = require('../server/lib/redis');
const logger = require('../server/lib/winston');

const init = async () => {
  try {
    await new Promise((resolve, reject) => {
      Redis.init(async (err) => {
        if (err) reject(err);
        else {
          logger.info('Redis connected successfully');
          resolve();
        }
      });
    });
    await mongo.connectMongo();
  } catch (err) {
    console.log(err);
  }
};
module.exports = { init };
