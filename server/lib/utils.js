const crypto = require("crypto");
const libPhone = require("google-libphonenumber");
const constants = require("../constants");

const formatValue = (name, type, value) => {
  switch (type) {
    case "number":
      if (isNaN(value)) {
        // eslint-disable-line no-restricted-globals
        throw new Error(`${name} must be a number`);
      }
      return Number(value);

    case "boolean":
      if (value === "true") return true;
      if (value === "false") return false;
      throw new Error(`${name} must be true or false`);

    case "string[]":
      return value.split(",");

    default:
      return value;
  }
};

const formatEnv = (vars) => {
  const formattedVars = {};
  vars.forEach((option) => {
    const defaultOption = {
      isOptional: false,
      type: "string",
    };
    // eslint-disable-next-line no-param-reassign
    option = { ...defaultOption, ...option };

    const { name, type, defaultValue } = option;

    const val = process.env[name];
    if (val === null || val === undefined) {
      if (defaultValue === undefined) {
        throw new Error(`Environment variable ${name} must be defined`);
      }
      formattedVars[name] = defaultValue;
    } else {
      formattedVars[name] = formatValue(name, type, val);
    }
  });
  return formattedVars;
};
/**
 * @param {string} errMsg - error message
 * @returns boolean
 */
const isDuplicateDocument = (errMsg) => {
  let flag = false;
  if (errMsg) {
    flag = errMsg.includes("duplicate key error collection");
  }
  return flag;
};

const cryptoRandomInteger = (length) =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(length, (err, buf) => {
      if (err) reject(err);
      const ret = parseInt(buf.toString("hex"), 16);
      resolve(ret);
    });
  });

const cryptoRandomString = (length, options) => {
  const defaultOptions = {
    upperCase: true,
    lowerCase: true,
    numeric: true,
  };

  // eslint-disable-next-line no-param-reassign
  options = options || {};
  // eslint-disable-next-line no-param-reassign
  options = { ...defaultOptions, ...options };

  let chars = "";
  if (options.lowerCase) chars += "abcdefghijklmnopqrstuvwxyz";
  if (options.upperCase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (options.numeric) chars += "0123456789";

  return new Promise((resolve, reject) => {
    crypto.randomBytes(length, (err, buffer) => {
      if (err) reject(err);
      const len = chars.length;
      const ret = [];
      for (let i = 0; i < length; i += 1) {
        ret[i] = chars.charAt(buffer[i] % len);
      }
      resolve(ret.join(""));
    });
  });
};

const PNF = libPhone.PhoneNumberFormat;
const phoneUtil = libPhone.PhoneNumberUtil.getInstance();

const formatNumber = (number) => {
  let phoneNumber;
  try {
    phoneNumber = phoneUtil.parse(`+${number}`);
  } catch (err) {
    return { isValid: false };
  }
  const isValid = phoneUtil.isValidNumber(phoneNumber);

  const ret = { isValid };
  if (isValid) ret.number = phoneUtil.format(phoneNumber, PNF.E164).substr(1); // drop the initial +
  return ret;
};
const randomNumericString = (length) =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(length, (err, buffer) => {
      if (err) reject(err);
      const chars = "0123456789";
      const ret = [];
      for (let i = 0; i < length; i += 1) {
        ret[i] = chars.charAt(buffer[i] % 10);
      }
      resolve(ret.join(""));
    });
  });

const doStringify = (data) => {
  if (!data) {
    throw new Error(constants.errors.NOT_FOUND);
  }
  return JSON.stringify(data);
};
const doParse = (data) => {
  if (data) {
    return JSON.parse(data);
  }
  return null;
};
const compareArray = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;

  arr1.sort();
  arr2.sort(); // sorting to make these array's order identical

  for (let i = 0; i < arr1.length; i += 1) {
    let value1 = arr1[i];
    let value2 = arr2[i];
    if (typeof value1 === "string") value1 = value1.normalize();
    if (typeof value2 === "string") value2 = value2.normalize();
    if (value1 !== value2) return false;
  }
  return true;
};
const validateAnswer = (actualAnswer, studentAnswer) => {
  if (!Array.isArray(studentAnswer)) {
    // eslint-disable-next-line no-param-reassign
    studentAnswer = [studentAnswer];
  }

  const isSame = compareArray(actualAnswer, studentAnswer);
  if (isSame) {
    if (
      actualAnswer &&
      studentAnswer &&
      actualAnswer.length === studentAnswer.length
    ) {
      return true;
    }
    return false;
  }
  return isSame;
};

const timeRangeChecker = (endTime, startTime) => {
  const obj = {
    started: false,
    ended: false,
  };
  if (endTime && new Date(endTime) <= new Date()) {
    obj.ended = true;
  }
  if (startTime && new Date(startTime) < new Date()) {
    obj.started = true;
  }
  obj.inRange = !obj.ended && obj.started;
  return obj;
};

const rankGenerate = (results = []) => {
  results.sort((a, b) => b.marksObtained - a.marksObtained);
  const ret = {};
  let highestMark = null;
  let rank = 1;
  let prevMark = null;
  results.forEach((res, idx) => {
    if (highestMark === null) highestMark = res.marksObtained;
    highestMark = Math.max(highestMark, res.marksObtained);

    if (prevMark === null || prevMark !== res.marksObtained) {
      rank = idx + 1;
      prevMark = res.marksObtained;
    }
    ret[res.studentId] = rank;
  });
  return { ranks: ret, highestMark };
};

// Construct query string from object
const constructQueryString = (params) => {
  return Object.keys(params)
    .map((key) => key + "=" + params[key])
    .join("&");
};

module.exports = {
  rankGenerate,
  timeRangeChecker,
  validateAnswer,
  doStringify,
  doParse,
  randomNumericString,
  formatEnv,
  isDuplicateDocument,
  cryptoRandomString,
  formatNumber,
  cryptoRandomInteger,
  constructQueryString,
};
