const BeeQ = require('bee-queue');
const logger = require('../winston');
const config = require('../../config');
const dao = require('../../data');

const WORKER_SIZE = process.env.WORKER_SIZE || 2;

const redis = {
  host: config.redis.host,
  port: config.redis.port,
};
if (config.redis.password) {
  redis.password = config.redis.password;
}
const handleMessgae = async (data = {}) => {
  try {
    const { examId, studentId, groupId } = data;
    const answers = await dao.examResult.getAnswers(examId, studentId, groupId);
    console.log('Exam Result: ', answers);
    if (!answers || !answers.length) return 'done';
    await dao.examResult.setAnswers(answers, examId, studentId);
    await dao.examResult.deleteAnswers(examId, studentId, groupId);
    return 'done';
  } catch (err) {
    return Promise.reject(err);
  }
};
let beeQ = null;
const createJob = async (data) => {
  try {
    console.log('BQ:DATA: ', data);
    const job = await beeQ.createJob(data).retries(3).save();
    job.on('succeeded', (result) => {
      logger.info(`Received result for job ${job.id}: ${result}`);
    });
    job.on('failed', (err) => {
      logger.error(`Job ${job.id} failed with error: ${err.message}`);
    });
    return job.id;
  } catch (err) {
    console.error(err);
    return Promise.reject(err);
  }
};

const createWorker = () => {
  const queue = new BeeQ('answers', {
    redis,
    isWorker: true,
  });
  queue.process((job, done) => {
    console.log('job data: ', job.data);
    handleMessgae(job.data)
      .then((data) => done(null, data))
      .catch((err) => done(err, null));
  });
};
const setupWorker = () => {
  for (let i = 0; i < WORKER_SIZE; i += 1) {
    createWorker();
  }
};
const setupQueue = () => {
  beeQ = new BeeQ('answers', {
    redis,
    isWorker: true,
  });
  beeQ.on('ready', async () => {
    logger.info(`Queue is now ready, running: ${beeQ.isRunning()}`);
    setupWorker();
  });
  beeQ.on('error', (err) => {
    logger.error(`A queue error happened: ${err.message}`);
  });
  beeQ.on('job retrying', (jobId, err) => {
    logger.error(
      `Job ${jobId} failed with error ${err.message} but is being retried!`,
    );
  });
};

const getQueue = () => {
  if (!beeQ) {
    setupQueue();
  }
  return beeQ;
};
module.exports = {
  setupQueue, getQueue, createJob,
};
