const { getSocket, initScoket } = require('./socket');

initScoket();
const socket = getSocket();

socket.on('error', (err) => {
  console.log(err);
});
socket.on('connect', () => {
  console.log('Connected');
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});

socket.on('message', (data) => {
  console.log('Message: ', data);
});

socket.on('notification', (data) => {
  console.log('Notification: ', data);
});

socket.on('CSVGenerated', (data) => {
  console.log('CSV Generated: ', data);
});
