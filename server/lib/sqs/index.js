const AWS = require("aws-sdk");
// Set the region
AWS.config.update({ region: "ap-southeast-1" });
const config = require("../../config");
const logger = require("../winston");
const { getClients } = require("../redis");
const constants = require("../../constants");
const { publishMessage } = require("../redis/pubSub");
const dao = require("../../data");

const { ioSub } = getClients();
let sqs;
// Create an SQS service object
const getSqs = () => {
  if (!sqs) {
    sqs = new AWS.SQS({
      apiVersion: "2012-11-05",
    });
  }
  return sqs;
};
let timeouId = null;

const handleMessgae = async (data = {}) => {
  console.log("Called handle message: ", data);
  try {
    const { examId, studentId, groupId } = data;
    const answers = await dao.examResult.getAnswers(
      examId.StringValue,
      studentId.StringValue,
      groupId.StringValue
    );
    console.log(examId.StringValue, studentId.StringValue, groupId.StringValue);
    console.log("Exam Result: ", answers);
    if (!answers || !answers.length) return "done";
    // TODO: have to add groupId in setAnswers
    await dao.examResult.setAnswers(
      answers,
      examId.StringValue,
      studentId.StringValue,
      groupId.StringValue
    );
    await dao.examResult.deleteAnswers(
      examId.StringValue,
      studentId.StringValue,
      groupId.StringValue
    );
    return "done";
  } catch (err) {
    return Promise.reject(err);
  }
};
const createJob = async (data) =>
  new Promise((resolve, reject) => {
    console.log("Called create job: ", data);
    const { examId, studentId, groupId } = data;
    const params2 = {
      // Remove DelaySeconds parameter and value for FIFO queues
      DelaySeconds: 1,
      MessageAttributes: {
        examId: {
          DataType: "String",
          StringValue: examId,
        },
        studentId: {
          DataType: "String",
          StringValue: studentId,
        },
        groupId: {
          DataType: "String",
          StringValue: groupId,
        },
      },
      MessageBody: `${examId}:${studentId}:${groupId}`,
      // MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
      // MessageGroupId: "Group1",  // Required for FIFO queues
      QueueUrl: config.sqs.queueUrl,
    };

    sqs.sendMessage(params2, (err, res) => {
      if (err) {
        logger.error(err);
        reject(err);
      } else {
        logger.info("Success", res.MessageId);
        publishMessage(constants.topic.CHECK_MESSAGE, 1);
        resolve(res);
      }
    });
  });

const checkMessage = () => {
  const params = {
    AttributeNames: ["SentTimestamp"],
    MaxNumberOfMessages: 1,
    MessageAttributeNames: ["All"],
    QueueUrl: config.sqs.queueUrl,
    VisibilityTimeout: 20,
    WaitTimeSeconds: 0,
  };

  sqs.receiveMessage(params, (err, data) => {
    
    if (err) {

    } else if (data.Messages) {
    // console.log("Data: ", data);
    //   if(data.Messages.length === 0) {
    //     return;
    //   }
      const deleteParams = {
        QueueUrl: config.sqs.queueUrl,
        ReceiptHandle: data.Messages[0].ReceiptHandle,
      };

      handleMessgae(data.Messages[0].MessageAttributes)
        .then(() => {
          sqs.deleteMessage(deleteParams, (err1, ret) => {
            if (err) {
              console.log("Delete Error", err1);
            } else {
              console.log("Message Deleted", ret);
            }
            checkMessage();
          });
        })
        .catch((err2) => {
          //logger.error(err2);
          checkMessage();
        });
    }
  });
};

const setupWorker = () => {
  getSqs();
  checkMessage();
  ioSub.subscribe(constants.topic.CHECK_MESSAGE, (err) => {
    if (err) {
      logger.error("Failed to subscribe: %s", err.message);
    } else {
      logger.info(
        `Subscribed channel successfully to: ${constants.topic.CHECK_MESSAGE}`
      );
    }
  });
  ioSub.on("message", (chnl, message) => {
    console.log("Got message:", chnl, message);
    if (timeouId) {
      clearTimeout(timeouId);
    }
    timeouId = setTimeout(() => {
      console.log("timeout called", timeouId);
      checkMessage();
    }, 10 * 1000);
  });
};

module.exports = {
  createJob,
  setupWorker,
  handleMessgae,
};
