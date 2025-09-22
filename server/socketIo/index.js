const socketIo = require('socket.io');
const socketIoRedis = require('socket.io-redis');
const redis = require('../lib/redis');
const logger = require('../lib/winston');

const { getClients } = redis;
const { ioPub, ioSub } = getClients();
let io = null;

const init = (server) => {
  io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket'],
    cookie: false,
    pingInterval: 10000,
    pingTimeout: 10000,
  });
  io.adapter(socketIoRedis({
    pubClient: ioPub,
    subClient: ioSub,
  }));
  io.of('/').adapter.on('error', (err) => {
    logger.error(err, `socketio adapter error: ${err.message}`);
  });
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${socket.id}, Reason: ${reason}`);
    });
  });
  return this;
};
const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
module.exports = { init, getIo };
