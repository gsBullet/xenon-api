const { getClients } = require('../../../lib/redis');

const createKey = (() => 'smsGateway')();
const { client } = getClients();

module.exports = {
  getSmsGateway: async () => {
    const gateway = await client.get(createKey);
    // console.log('getSmsGateway ', gateway )
    return gateway;
  },
  setSmsGateway: (data) => {
    // console.log('setSmsGateway ', data );
    client.set(createKey, data);
  },
};
