/* eslint-disable no-param-reassign */
const passport = require('passport');
const socketIo = require('./index');
const cookieHandler = require('../lib/coockieHandler');
const connectionHandler = require('./connectionHandler');

const init = (server, session) => {
  socketIo.init(server);
  const io = socketIo.getIo();
  io.use((socket, next) => {
    socket.request.query = socket.handshake.query;
    cookieHandler.setCookieFromQuery(socket.request, {}, next);
  });
  io.use((socket, next) => {
    session(socket.request, {}, next);
  });
  io.use((socket, next) => {
    passport.initialize()(socket.request, {}, next);
  });
  io.use((socket, next) => {
    passport.session()(socket.request, {}, next);
  });
  io.use((socket, next) => {
    if (!socket.request.isAuthenticated()) {
      setTimeout(() => {
        socket.disconnect();
      }, 3000);
      next(new Error('notLoggedIn'));
    } else {
      next();
    }
  });
  connectionHandler.init(io);
};
module.exports = { init };
