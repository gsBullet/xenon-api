/* eslint-disable no-underscore-dangle */
const { getClients } = require('../../../lib/redis');

const createKey = () => 'connection:total';
const createConnectionSet = () => 'connection:set';
const createRequestKey = (key) => `requests:time:${key}`;
const createKeyOld = (key) => `connection:${key}`;
const { client } = getClients();
const day7 = 604800;

const freeConnections = async (min) => {
  const cons = await client.zrangebyscore(createConnectionSet(), '-inf', min);
  if (!cons) return;
  cons.forEach((key) => {
    client.hdel(createKey(), key);
  });
  client.zremrangebyscore(createConnectionSet(), '-inf', min - 10);
};

// TODO: Remove this on next release
const removeOldConnection = async () => {
  const pipeline = client.pipeline();
  const keys = await client.keys(createKeyOld('*'));
  keys.forEach((key) => {
    pipeline.del(key);
  });
  pipeline.exec();
};

module.exports = {
  deleteAll: async () => {
    const ok = await Promise.all([
      client.del(createKey()),
      client.del(createConnectionSet()),
      client.del(createRequestKey()),
      client.del(createKeyOld()),
    ]);
    return ok;
  },
  insert: async (key, data = 0) => {
    await client.hmset(createKey(), key, Number(data));
    await client.zadd(createConnectionSet(), Date.now(), key);
  },
  getAcitiveUserCount: async () => {
    const min = Date.now() - 60000; // MS_PER_MINUTE = 60000;
    const instances = await client.zrangebyscore(createConnectionSet(), min, '+inf');
    const data = await client.hgetall(createKey());
    if (!data || !instances) return 0;
    let counts = 0;
    instances.forEach((k) => {
      counts += Number(data[k] || 0) || 0;
    });
    removeOldConnection();
    freeConnections(min);
    return counts;
  },
  delete: async (key) => {
    const data = await client.del(createKey(key));
    return data;
  },
  removeActiveUserCount: (cb) => {
    const stream = client.scanStream({ match: createKey('*') });
    stream.on('data', (keys) => {
      // keys
    });
    stream.on('end', () => {
      cb('done');
    });
  },
  incrementRequestCount: () => {
    const nowDate = new Date();

    const min = Math.floor(nowDate.getMinutes());
    const key = `${nowDate.getHours()}:${min}`;
    client.incr(createRequestKey(key));
    client.expire(createRequestKey(key), 600);
  },
  getAllRequestCounts: (cb) => {
    const ret = {};
    const getData = async (key) => {
      const count = await client.get(key);
      const [, k] = key && key.split('time:');
      ret[k] = count;
    };
    const stream = client.scanStream({ match: createRequestKey('*') });
    const requests = [];
    stream.on('data', (keys) => {
      if (keys.length) {
        keys.forEach((key) => {
          requests.push(getData(key));
        });
      }
    });
    stream.on('end', () => {
      Promise.all(requests)
        .then(() => cb(ret, null))
        .catch((err) => cb(null, err));
    });
  },
};
