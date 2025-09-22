const logger = require('../lib/winston');

const init = (io) => {
  logger.info('SocketIo setup done');
  if (!io) {
    throw new Error('SocketIo not initialized');
  }
  // console.log('SocketIo not initialized', io);
  io.on('connection', (socket) => {
    const {
      id, username,
    } = socket.request.user;
    if (username) socket.join(username);
    if (id) socket.join(`${id}`);
    if (id) socket.join(id);
    socket.on('disconnect', () => {
      // console.log(`${username} left`);
    });
  });
};

module.exports = { init };
