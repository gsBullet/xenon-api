const { getClients } = require('../../../lib/redis');

const createKey = (key) => `sess:${key}`;

module.exports = {
  deleteByKey: async (key) => {
    const { client } = await getClients();
    const data = await client.del(createKey(key));
    return data;
  },
};
