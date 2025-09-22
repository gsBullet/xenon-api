const admin = require('./admin');
const course = require('./course');
const branch = require('./branch');
const student = require('./student');
const session = require('./session');
const group = require('./group');
const subject = require('./subject');
const lecture = require('./lecture');
const chapter = require('./chapter');
const content = require('./content');
const question = require('./question');
const exam = require('./exam');
const examResult = require('./examResult');
const notification = require('./notification');
const file = require('./file');
const analitycs = require('./analitycs');
const completion = require('./completion');
const gateway = require('./gateway');
const questionSolve = require('./questionSolve');

module.exports = {
  questionSolve,
  gateway,
  completion,
  analitycs,
  file,
  notification,
  examResult,
  exam,
  question,
  content,
  chapter,
  lecture,
  subject,
  group,
  session,
  student,
  branch,
  course,
  admin,
};
