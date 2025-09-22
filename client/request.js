const axios = require('axios');

const serverURL = 'http://localhost:3141/api';
const authorization = 's%3APaH0D4kMrOBgUd-g4TyWWHyDJAnROWSd.vvYkW4TyEVR1FxAsNZ%2BzwiLjtcDxI4B5675mAXG%2BKvQ';
const a = axios.create({
  baseURL: `${serverURL}`,
  headers: {
    agent: 'browser',
    authorization: `${authorization}`,
  },
  timeout: 20000,
});
const req = () => a.patch('/exam/add-answer/5fe882eb3827ec72d500d34b/group/5fd0e08dae595163a7cda9ca', { questionId: '5fe73aa5596fed52bd9b32fa', answer: ['SO_2'] });

Promise.all([
  req(), req(),
]).then((res) => {
  res.forEach(({ data }) => {
    console.log('Request.js', data);
  });
}).catch((e) => { console.log(e.response.data); });
