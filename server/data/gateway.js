const smsGatewayRedisImpl = require('./impl/redis/smsGateway');

module.exports = {
  setSmsGateway: (data) => smsGatewayRedisImpl.setSmsGateway(data),
  getSmsGateway: async () => smsGatewayRedisImpl.getSmsGateway(),
};
