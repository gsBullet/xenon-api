const constants = require('../constants');
const dao = require('../data');
const logger = require('../lib/winston');

module.exports = {
    getSmsGateway: async (req, res) => {
        try {
            const gateway = await dao.gateway.getSmsGateway();
            if (!gateway) {
                res.ok({gateway: constants.smsGateway.REVE});
            }
            res.ok({gateway});
        } catch (err) {
            logger.error(err);
            res.serverError(err);
        }
    },
    setSmsGateway: async (req, res) => {
        try {
            await dao.gateway.setSmsGateway(req.body.gateway);
            //FORCEFULLY SET reve SMS GATEWAY
            //await dao.gateway.setSmsGateway('reve');
            res.ok({gateway: req.body.gateway});
        } catch (err) {
            logger.error(err);
            res.serverError(err);
        }
    },
};
