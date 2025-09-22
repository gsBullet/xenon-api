/* eslint-disable no-underscore-dangle */
const { getClients } = require('../../../lib/redis');
const utils = require('../../../lib/utils');

const createKey = (key) => `exam:${key}`;
const { client } = getClients();
const TTL = 600; //* 10 minutes

module.exports = {
  insert: (data) => {
    const JO = utils.doStringify(data);
    client.set(createKey(data._id), JO, 'ex', TTL);
  },
  get: async (id) => {
    const data = await client.get(createKey(id));
    return utils.doParse(data);
  },
  delete: async ({ _id }) => {
    const data = await client.del(createKey(_id));
    return data;
  },
};
