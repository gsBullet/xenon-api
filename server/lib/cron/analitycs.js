const mac = require('getmac').default();
const socketIo = require('../../socketIo/index');
const data = require('../../data');

module.exports = {
  setActiveUser: () => {
    const io = socketIo.getIo();
    data.analitycs.insert(mac, io.sockets.server.engine.clientsCount);
  },
};
