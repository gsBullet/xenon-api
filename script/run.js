/* eslint-disable global-require */
/* eslint-disable no-console */
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const mongo = require('../server/lib/mongoose');
const constants = require('../server/constants');
const Student = require('../server/models/Student');
const ExamResults = require('../server/models/ExamResult');
const Redis = require('../server/lib/redis');

const run = async () => {
  try {
    await mongo.connectMongo();
    const csvWriter = createCsvWriter({
      path: './csv/file.csv',
      header: ['name', 'phone'],
    });
    const students = await Student.find({ status: constants.student.status.PENDING });
    console.log('# of fetched students', students.length);
    const records = students.map((s) => ({ name: s.name, phone: s.username }));
    await csvWriter.writeRecords(records);
    console.log('Done CSV');
  } catch (err) {
    console.log(err);
  }
};

const initRedis = async () => {
  await new Promise((resolve, reject) => {
    Redis.init((err) => {
      if (err) reject(err);
      else {
        console.log('Redis connected successfully');
        resolve();
      }
    });
  });
};

const getData = async () => {
  try {
    await initRedis();
    const Exam = require('../server/models/Exam');
    const Question = require('../server/models/Question');
    const Group = require('../server/models/Group');
    await mongo.connectMongo();
    const date = new Date('2021-03-26').setHours(0, 0, 0, 0);
    const dt = new Date(date);
    const total = await ExamResults.countDocuments({ });
    const totalQ = await Question.countDocuments({ });
    const latsJanRes = await ExamResults.countDocuments({ createdAt: { $gte: dt } });
    const totalExam = await Exam.countDocuments({ });
    const latsJanExam = await Exam.countDocuments({ createdAt: { $gte: dt } });
    const lastMonthLiveExamCreated = await Exam.countDocuments({
      createdAt: { $gte: dt },
      isPracticeExam: true,
    });
    const lastMonthExamLived = await Group.countDocuments({
      'exams.startsAt': { $gte: dt },
    });
    console.log({
      LastMonthExamPerticipation: latsJanRes,
      TotalExamPerticipation: total,
      TotalCreatedExam: totalExam,
      LastMonthCreatedExam: latsJanExam,
      TotalQuestion: totalQ,
      lastMonthLiveExamCreated,
      lastMonthExamLived,
    });
    // console.log(exams);
  } catch (err) {
    console.log(err);
  }
};

getData();
