/* eslint-disable no-underscore-dangle */
const { get } = require("mongoose");
const { getClients } = require("../../../lib/redis");
const utils = require("../../../lib/utils");
const logger = require("../../../lib/winston");
const { removeExam } = require("../mongo/group");

const createKey = (examId, groupId, studentId) =>
  `answer:${examId}:${groupId}:${studentId}`;
const createExamResultKey = (examId, groupId, studentId) =>
  `exam-result:${examId}:${groupId}:${studentId}`;
const examParticipantKey = (examId, groupId) =>
  `exam:${examId}:students:${groupId}`;
const startedExamKey = () => "started_exams";
const resultProcessKey = (groupId, examId) => `result:${examId}:${groupId}`;
const examGroupKey = (examId, groupId) => `${examId}:${groupId}`;
const examsToMoveToPractice = "examsToMoveToPractice";

const { client } = getClients();
const TTL = 86400; //* 24 hours
const MIN15 = 60 * 15;

module.exports = {
  insert: async (data, examId, studentId, groupId) => {
    const { questionId } = data;
    const JO = utils.doStringify(data);
    const ok = await client.hmset(
      createKey(examId, groupId, studentId),
      questionId,
      JO
    );
    logger.info(
      `Add answer for exam: ${examId} student: ${studentId}, group: ${groupId} and data :${JSON.stringify(
        data
      )}`
    );
    client.expire(createKey(examId, groupId, studentId), TTL);
    return ok;
  },

  addExamToMoveToPractice: async (examId, scheduledTime) => {
    // Get current timestamp in milliseconds
    try {
      const timestamp = new Date(scheduledTime).getTime();

      if (Number.isNaN(timestamp)) {
        throw new Error("addExamToMoveToPractice Invalid timestamp provided");
      }
      await client.zadd(examsToMoveToPractice, timestamp, examId);
      console.log(
        `addExamToMoveToPractice Exam ${examId} added to update list at ${new Date(
          scheduledTime
        ).toISOString()}`
      );
    } catch (err) {
      console.log(
        "addExamToMoveToPractice Error in adding exam to update list",
        err
      );
    }
  },

  removeExamFromUpdateList: async (examId) => {
    try {
      await client.zrem(examsToMoveToPractice, examId);
      console.log(
        `removeExamFromUpdateList Exam ${examId} removed from update list.`
      );
    } catch (err) {
      console.log(
        "removeExamFromUpdateList Error in removing exam from update list",
        err
      );
    }
  },

  getExamsToMoveToPractice: async () => {
    const now = Date.now();
    try {
      const exams = await client.zrangebyscore(
        examsToMoveToPractice, // Redis sorted set key
        "-inf", // Get all exams from the beginning of time
        now // Up to the current timestamp
      );

      console.log(
        `getExamsToMoveToPractice Get exams to move to practice called @${new Date(
          now
        ).toISOString()} and found ${exams.length} exams`
      );

      return exams;
    } catch (error) {
      console.error(
        "getExamsToMoveToPractice Error fetching exams to move to practice:",
        error
      );
      return [];
    }
  },

  getStudentAnswer: async (examId, studentId, questionId, groupId) => {
    const data = await client.hget(
      createKey(examId, groupId, studentId),
      questionId
    );
    const ret = utils.doParse(data);

    return ret;
  },
  isStudentAnswered: async (examId, studentId, questionId, groupId, index) => {
    const data = await client.hget(
      createKey(examId, groupId, studentId),
      questionId
    );
    const ret = utils.doParse(data);
    console.log("isStudentAnswered", ret, index);
    if (ret && index && ret.questionType === "MCA") {
      return ret.answer[index] !== "N";
    }

    return ret;
  },

  // when exam published in a group
  scheduleExam: async (examId, groupId, endsAt) => {
    const endTimestamp = new Date(endsAt).valueOf();
    logger.info(
      `Add schedule exam in redis started exams: ${examId}, group: ${groupId}, end: ${endsAt}`
    );
    return client.zadd(
      startedExamKey(),
      endTimestamp,
      examGroupKey(examId, groupId)
    );
  },

  // published exams in a group
  /**
   * @deprecated
   */
  getStartedExams: async (cb) => {
    // TODO: Get from zset by score
    const getValue = async (key) => {
      try {
        const [, examId, , groupId] = key.split(":");
        const endsAt = await client.get(key);
        if (!endsAt) client.del(key);
        return { examId, endsAt, groupId };
      } catch (err) {
        return Promise.reject(err);
      }
    };
    try {
      const stream = client.scanStream({
        match: startedExamKey("*", "*"),
        count: 50,
      });
      const requests = [];
      stream.on("data", (resultKeys) => {
        resultKeys.forEach((key) => {
          requests.push(getValue(key));
        });
      });
      stream.on("end", async () => {
        const res = await Promise.all(requests);
        const ret = [];
        res.forEach((exam = {}) => {
          const { endsAt } = exam;
          if (endsAt < Date.now()) {
            ret.push(exam);
          }
        });
        cb(ret, null);
      });
    } catch (err) {
      cb(null, err);
    }
  },

  addToStartExamSet: async (examId, studentId, groupId) =>
    client.sadd(examParticipantKey(examId, groupId), studentId),

  removeFromSet: (examId, studentId, groupId) =>
    client.srem(examParticipantKey(examId, groupId), studentId),
  getExamParticipant: (examId, groupId) => {
    logger.info(
      `Exam participant pop from redis called: exam: ${examId} group: ${groupId}`
    );
    return client.spop(examParticipantKey(examId, groupId));
  },

  deleteAnswers: (examId, groupId, studentId) => {
    logger.info(
      `Delete answers called from redis for student: ${studentId}, exam: ${examId}, group: ${groupId}`
    );
    const ok = client.del(createKey(examId, groupId, studentId));
    return ok;
  },

  answers: async (examId, groupId, studentId) => {
    const data = await client.hgetall(createKey(examId, groupId, studentId));
    const ret = Object.values(data).map((d) => utils.doParse(d));
    console.log(
      `answer for student: ${studentId}, exam: ${examId} data: `,
      data
    );
    return ret;
  },

  deleteStartedExam: async (examId, groupId) => {
    console.log(
      `Delete schedules exam: ${examId} from redis for group: ${groupId}`
    );
    return client.zrem(startedExamKey(), examGroupKey(examId, groupId));
  },

  // is specefic exam started in a group
  isExamStarted: async (examId, groupId) =>
    client.zscore(startedExamKey(), examGroupKey(groupId, examId)),

  // true -> processing, false -> notProcessing
  setExamResultProcess: async (examId, groupId, flag) =>
    client.set(resultProcessKey(groupId, examId), flag, "ex", TTL * 7),

  getExamResultProcess: async (examId, groupId) =>
    client.get(resultProcessKey(groupId, examId)),

  // NEW CODE
  setExamResult: async (examId, studentId, groupId, data) => {
    const ok = await client.set(
      createExamResultKey(examId, groupId, studentId),
      JSON.stringify(data)
    );
    client.expire(createExamResultKey(examId, groupId, studentId), MIN15);
    return ok;
  },

  getExamResult: async (examId, studentId, groupId) => {
    const data = await client.get(
      createExamResultKey(examId, groupId, studentId)
    );
    client.expire(createExamResultKey(examId, groupId, studentId), MIN15);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  },

  getFinishedExams: async () => {
    console.log("Get finished exam called");
    const now = Date.now();
    let data = await client.zrangebyscore(startedExamKey(), "-inf", now);
    data = data || [];
    logger.info(
      `Get finished exam called @${now} and found ${data.length} finished exams`
    );
    return data.map((d) => {
      const [examId, groupId] = d.split(":");
      return { examId, groupId };
    });
  },
};
