/* eslint-disable no-underscore-dangle */
const { getClients } = require('../../../lib/redis');
const utils = require('../../../lib/utils');

const createKey = (key) => `question:${key}`;
const { client } = getClients();
const TTL = 300; //* 5 minutes

module.exports = {
  insert: (data) => {
    const JO = utils.doStringify(data);
    client.set(createKey(data._id), JO, 'ex', TTL);
  },
  get: async (id) => {
    const data = await client.get(createKey(id));
    return utils.doParse(data);
  },
};
