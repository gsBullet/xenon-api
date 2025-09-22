const mongoose = require('mongoose');
const mongo = require('../../server/lib/mongoose');

const dropCollection = async (collectionName) => {
  await mongo.connectMongo();
  mongoose.connection.db.dropCollection(collectionName, (err) => {
    if (err) console.error(err);
    console.log('collection dropped');
  });
};

dropCollection('subjects');
