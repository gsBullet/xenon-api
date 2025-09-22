const socketIoClient = require('socket.io-client');

let socket;
const initScoket = () => {
  socket = socketIoClient(
    'http://localhost:3141', {
      path: '/socket.io',
      transports: ['websocket'],
      query: {
        sessionId: 's%3A8qSmzgn6cazPUyHJokQkWsMhc6ldtS49.pL8TDvzi5wcJOfGi4whH72qwRnQmIyGgjXXokVxqSq8',
      },
    },
  );
};

const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized');
  }
  return socket;
};

module.exports = { initScoket, getSocket };
