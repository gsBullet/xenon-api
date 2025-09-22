const express = require('express');
const { cryptoRandomString } = require('../lib/utils');
const logger = require('../lib/winston');
const Dummy = require('../models/Dummy');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await Dummy.find({})
      .sort({ _id: -1 })
      .limit(100)
      .lean();
    res.ok(data);
  } catch (err) {
    logger.error(err);
    res.serverError(err);
  }
});

router.post('/', async (req, res) => {
  try {
    const randString = await cryptoRandomString(8);
    const data = {
      title: randString,
      instruction: randString + randString,
      comments: `${randString}${Math.random() * 10000}`,
    };
    const newDummy = new Dummy(data);
    const createdDummy = await newDummy.save();
    res.ok(createdDummy);
  } catch (err) {
    logger.error(err);
    res.serverError(err);
  }
});
module.exports = router;
