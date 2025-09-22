/* eslint-disable no-nested-ternary */
/* eslint-disable no-underscore-dangle */
const fsSync = require("fs");

const fs = fsSync.promises;
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const aws = require("aws-sdk");
const Promise = require("bluebird");
const slug = require("slug");
const config = require("../config");
const dao = require("../data");
const logger = require("./winston");
const notification = require("./notification");
const constants = require("../constants");
const fileEncryptor = require("./file");

const s3 = new aws.S3();

const { bucket } = config.s3;
const REACT_APP_ASSET_URL = "https://assets.xenonbd.org/";
// const REACT_APP_ASSET_URL =
//   "https://retina-dev-files.s3.ap-southeast-1.amazonaws.com/";
const isValidJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};
const uploadToS3 = async (fileName, fileContent) => {
  const key = `csv/${fileName}`;
  console.log("uploading to s3", key, bucket);
  const params = {
    Bucket: bucket,
    Key: key,
    Body: fileContent,
    ACL: "public-read",
  };
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

const formatData = async (examIds, data) => {
  const headers = [
    { id: "sl", title: "Serial" },
    { id: "studentName", title: "Name" },
    { id: "sid", title: "Student ID" },
    { id: "username", title: "Phone" },
    { id: "contact", title: "Parent Phone" },
    { id: "totalMarks", title: "Total marks" },
    { id: "count", title: "Count" },
  ];
  const pormises = [];
  examIds.forEach((e) => {
    pormises.push(dao.exam.getById(e));
  });
  const exams = await Promise.all(pormises);
  exams.forEach((e) => {
    if (e) {
      headers.push({ id: e.title, title: e.title });
    }
  });
  const users = [];
  data.forEach((d, idx) => {
    if (d && d.student) {
      const obj = {
        studentName: d.student.name,
        sid: d.student.sid,
        username: d.student.username,
        contact: d.student.contact,
        totalMarks: d.total,
        count: d.count,
        sl: idx + 1,
      };
      d.marks.forEach((m) => {
        if (m) {
          obj[m.examId.title] = m.marksObtained;
        }
      });
      users.push(obj);
    }
  });

  console.log("users", users, headers);
  return { users, headers };
};

const generateMeritList = async ({ examIds, userId }, data) => {
  try {
    const dir = "./csv";
    fs.stat(dir).catch(async (err) => {
      if (err.message.includes("no such file or directory")) {
        await fs.mkdir(dir);
      }
    });
    const { users, headers } = await formatData(examIds, data);

    const csvWriter = createCsvWriter({
      path: "./csv/file.csv",
      header: headers,
    });

    await csvWriter.writeRecords(users);
    const dest = "./csv/file_enc.xlsx";
    if (fsSync.existsSync(dest)) {
      fsSync.unlinkSync(dest);
    }
    await fileEncryptor.encrypt("csv/file.csv", dest);

    const fileContent = await fs.readFile(dest);

    const ret = await uploadToS3(`${Date.now()}.xlsx`, fileContent);
    if (ret) {
      const file = {
        URL: ret.Location,
        exams: examIds,
        name: ret.Key,
        category: constants.CSV.category.MERIT_LIST,
      };
      const createdFile = await dao.file.create(file);
      notification.sendFileGeneratedNotification(userId, createdFile);
    }
    return users;
  } catch (err) {
    logger.error(err);
  }
};
const studentsData = async (students = []) => {
  // , session = '', courseId = '' ) => {
  const headers = [
    { id: "name", title: "Name" },
    { id: "sid", title: "Student ID" },
    { id: "username", title: "Phone" },
    { id: "contact", title: "Parent Phone" },
    { id: "firstTime", title: "Attempt" },
    { id: "branch", title: "Branch" },
    { id: "courses", title: "Courses" },
    { id: "groups", title: "Groups" },
    { id: "SSCGPA", title: "SSC" },
    { id: "HSCGPA", title: "HSC" },
    { id: "status", title: "Active Status" },
    { id: "code", title: "Unique Identifier" },
    { id: "link", title: "Alternate Exam Link" },
  ];
  const [courses, groups, branches] = await Promise.all([
    dao.course.getAll(),
    dao.group.getAll(), // session, courseId),
    dao.branch.getAll(),
  ]);
  const branchObj = {};
  branches.forEach((b) => {
    if (b) {
      branchObj[b._id] = b.name;
    }
  });
  const courseObj = {};
  courses.forEach((c) => {
    if (c) {
      courseObj[c._id] = c.name;
    }
  });
  const getCourses = (cs) => {
    console.log("cs", cs);
    let courseName = "";
    if (cs === undefined) return courseName;
    cs.forEach((c, idx) => {
      if (idx > 0) {
        courseName += courseObj[c]
          ? courseName
            ? ` - ${courseObj[c]}`
            : `${courseObj[c]}`
          : "";
      } else {
        courseName += `${courseObj[c] || ""}`;
      }
    });
    return courseName;
  };
  const groupObj = {};
  groups.forEach((g) => {
    if (g) {
      groupObj[g._id] = g.name;
    }
  });
  const getGroups = (gs) => {
    let groupName = "";

    if (gs === undefined) return groupName;

    gs.forEach((g, idx) => {
      if (idx > 0) {
        groupName += groupObj[g]
          ? groupName
            ? ` - ${groupObj[g]}`
            : `${groupObj[g]}`
          : "";
      } else {
        groupName += `${groupObj[g] || ""}`;
      }
    });
    return groupName;
  };
  const sutudentsMaped = students.map((s) => ({
    ...s,
    firstTime: s.firstTime ? "1st" : "2nd",
    courses: getCourses(s.courses),
    groups: getGroups(s.groups),
    branch: branchObj[s.branch],
  }));

  return { students: sutudentsMaped, headers };
};
const generateStudentList = async (students, courseId, session) => {
  const dir = "./csv";
  fs.stat(dir).catch(async (err) => {
    if (err.message.includes("no such file or directory")) {
      await fs.mkdir(dir);
    }
  });
  const { students: studentsList, headers } = await studentsData(students); // , session, courseId);
  //console.log(studentsList.slice(0, 2), headers);
  const date = new Date().toString().split(":").join(" ").substr(4, 17);
  const fileName = slug(`Student list ${date}`);
  const src = `./csv/${fileName}.csv`;

  const csvWriter = createCsvWriter({
    path: src,
    header: headers,
  });
  await csvWriter.writeRecords(studentsList);
  const dest = `./csv/${fileName}-enc.xlsx`;
  if (fsSync.existsSync(dest)) {
    fsSync.unlinkSync(dest);
  }
  await fileEncryptor.encrypt(src, dest);

  const fileContent = await fs.readFile(dest);

  const ret = await uploadToS3(`${fileName}.xlsx`, fileContent);
  if (fsSync.existsSync(dest)) {
    fsSync.unlinkSync(dest);
  }
  if (fsSync.existsSync(src)) {
    fsSync.unlinkSync(src);
  }
  return { fileName: `${fileName}.xlsx`, S3: ret };
};

const examData = ({ questions }) => {
  const headers = [
    { id: "title", title: "Title" },
    { id: "type", title: "Type" },
    { id: "options", title: "Options" },
    { id: "answers", title: "Answers" },
    { id: "explanation", title: "Explanation" },
  ];
  const qs = questions.map(({ question: q }) => ({
    title: q.title,
    type: q.type,
    options: q.options.join(","),
    answers: q.answer.join(","),
    explanation: q.explanation,
  }));
  return { headers, questions: qs };
};

// const questionData = ({ questions }) => {
//   const headers = [
//     { id: "title", title: "title" },
//     { id: "type", title: "type" },
//     { id: "option1", title: "option1" },
//     { id: "option2", title: "option2" },
//     { id: "option3", title: "option3" },
//     { id: "option4", title: "option4" },
//     { id: "answers", title: "answer" },
//     { id: "explanation", title: "explanation" },
//   ];
//   const getOptionNumber = (opts, ans) => {
//     if (!opts || !ans) {
//       return "";
//     }
//     for (let i = 0; i < opts.length; i++) {
//       if (opts[i] == ans) {
//         return i + 1;
//       }
//     }
//     return "NO MATCH FOUND";
//   };
//   const qs = questions.map((q) => ({
//     title: q.title,
//     type: q.type,
//     option1: q.options[0],
//     option2: q.options[1],
//     option3: q.options[2],
//     option4: q.options[3],
//     answers: getOptionNumber(q.options, q.answer.join(",")), // q.answer.join(','),
//     explanation: q.explanation,
//   }));
//   // for each qs, replace "answers" with the option-number of the correct answer
//   return { headers, questions: qs };
// };

const questionData = ({ questions }) => {
  const headers = [
    { id: "title", title: "title" },
    { id: "type", title: "type" },
    { id: "option1", title: "option1" },
    { id: "option2", title: "option2" },
    { id: "option3", title: "option3" },
    { id: "option4", title: "option4" },
    { id: "answers", title: "answer" },
    { id: "explanation", title: "explanation" },
  ];

  const getOptionNumber = (opts, ans) => {
    if (!opts || !ans) {
      return "";
    }
    for (let i = 0; i < opts.length; i++) {
      if (opts[i] === ans) {
        return i + 1;
      }
    }
    return "NO MATCH FOUND";
  };

  const qs = questions.map((q) => {
    const optionTypes = isValidJSON(q.optionType)
      ? JSON.parse(q.optionType)
      : {};

    const options = q.options.map((option) => {
      const type = optionTypes[option];
      return type === "image" ? `${REACT_APP_ASSET_URL}${option}` : option;
    });

    return {
      title: q.title,
      type: q.type,
      option1: options[0] || "",
      option2: options[1] || "",
      option3: options[2] || "",
      option4: options[3] || "",
      answers: getOptionNumber(options, `${REACT_APP_ASSET_URL}${q.answer[0]}`),
      explanation: q.explanation || "",
    };
  });

  return { headers, questions: qs };
};

const generateExam = async (exam) => {
  const dir = "./csv";
  fs.stat(dir).catch(async (err) => {
    if (err.message.includes("no such file or directory")) {
      await fs.mkdir(dir);
    }
  });
  const { headers, questions } = examData(exam);
  const fileName = slug(exam.title);
  const src = `./csv/${fileName}.csv`;
  const csvWriter = createCsvWriter({
    path: src,
    header: headers,
  });
  await csvWriter.writeRecords(questions);
  const dest = `./csv/${fileName}-enc.xlsx`;
  if (fsSync.existsSync(dest)) {
    fsSync.unlinkSync(dest);
  }
  await fileEncryptor.encrypt(src, dest);

  const fileContent = await fs.readFile(dest);
  const ret = await uploadToS3(`${fileName}.xlsx`, fileContent);
  if (fsSync.existsSync(dest)) {
    fsSync.unlinkSync(dest);
  }
  if (fsSync.existsSync(src)) {
    fsSync.unlinkSync(src);
  }
  return { fileName: `${fileName}.xlsx`, S3: ret };
};

const generateQuestion = async (question) => {
  const { headers, questions } = questionData({ questions: question });
  const dir = "./csv";
  fs.stat(dir).catch(async (err) => {
    if (err.message.includes("no such file or directory")) {
      await fs.mkdir(dir);
    }
  });
  const date = new Date().toString().split(":").join(" ").substr(4, 17);
  const fileName = slug(`questions ${date}`);
  const src = `./csv/${fileName}.csv`;
  const csvWriter = createCsvWriter({
    path: src,
    header: headers,
  });
  await csvWriter.writeRecords(questions);
  const dest = `./csv/${fileName}-enc.xlsx`;
  if (fsSync.existsSync(dest)) {
    fsSync.unlinkSync(dest);
  }
  await fileEncryptor.encrypt(src, dest);

  const fileContent = await fs.readFile(dest);
  const ret = await uploadToS3(`${fileName}.xlsx`, fileContent);
  if (fsSync.existsSync(dest)) {
    fsSync.unlinkSync(dest);
  }
  if (fsSync.existsSync(src)) {
    fsSync.unlinkSync(src);
  }
  return { fileName: `${fileName}.xlsx`, S3: ret };
};
module.exports = {
  generateMeritList,
  generateStudentList,
  generateExam,
  generateQuestion,
};
