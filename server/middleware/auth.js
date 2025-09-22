const { getClients } = require("../lib/redis");

const constants = require("../constants");
const { client } = getClients();
const extractSessionId = (fullSessionId) => {
  // Step 1: Decode the session ID
  const decodedSessionId = decodeURIComponent(fullSessionId);

  // Step 2: Remove the "s:" prefix and extract the main ID
  const sessionId = decodedSessionId.split(".")[0].split(":")[1]; // Remove 's:' prefix

  return sessionId;
};

async function getSessionData(sessionId, requestPath) {
  const rawSessionId = decodeURIComponent(sessionId); // Decode session ID
  const extractedSessionId = extractSessionId(rawSessionId);
  if (!extractedSessionId || extractedSessionId === undefined) {
    console.log("getSessionData extractedSessionId undefined for ", requestPath);
    return false;
  }
  const sessionKey = `sess:${extractedSessionId}`; // Construct Redis key

  console.log("getSessionData Session Key:", sessionKey); // Log session key
  try {
    const sessionData = await client.get(sessionKey); // Query Redis
    console.log("getSessionData Session Data:", sessionData); // Debug log
    if (sessionData) {
      //console.log("getSessionData Session Data:", JSON.parse(sessionData)); // Log session data
      return true;
    } else {
      console.log("getSessionData Session not found");
      return false;
    }
  } catch (error) {
    console.error("getSessionData Error accessing Redis:", error);
    return false;
  }
}

const isLoggedIn = async (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
    return;
  }

  const session = await getSessionData(req.headers.authorization, req.path);
  if (session) {
    next();
    return;
  }

  // Call getSessionData function
  res.unauthorized({
    code: "notLoggedIn",
    title: "Session expired!",
  });
};
const isStudent = (req, res, next) => {
  const { roles } = req.user;
  if (roles.includes(constants.student.roles.STUDENT)) {
    next();
    return;
  }
  res.forbidden({ title: "You are not allowed" });
};

const authorizeAdmin = (req, res, next) => {
  const { roles } = req.user;
  if (roles.includes(constants.admin.roles.ADMIN)) {
    next();
    return;
  }
  res.forbidden({ title: "You are not allowed" });
};
const authorizeAdminType = (req, res, next) => {
  const { roles } = req.user;
  if (!roles.includes(constants.student.roles.STUDENT)) {
    next();
    return;
  }
  res.forbidden({ title: "You are not allowed" });
};
const authorizeModerator = (req, res, next) => {
  const { roles } = req.user;
  const { ADMIN, MODERATOR } = constants.admin.roles;
  if (roles.includes(ADMIN) || roles.includes(MODERATOR)) {
    next();
    return;
  }
  res.forbidden({ title: "You are not allowed" });
};
const authorizeInstructor = (req, res, next) => {
  const { roles } = req.user;
  const { ADMIN, MODERATOR, INSTRUCTOR } = constants.admin.roles;
  const isValidUser =
    roles.includes(ADMIN) ||
    roles.includes(MODERATOR) ||
    roles.includes(INSTRUCTOR);
  if (isValidUser) {
    next();
    return;
  }
  res.forbidden({ title: "You are not allowed" });
};
/**
 * @description it authorize student, instructor, moderator, admin, exam moderator
 */
const authorizeSAIMEM = (req, res, next) => {
  const { roles } = req.user;
  const { courseId } = req.query;
  const { ADMIN, MODERATOR, EXAM_MODERATOR, INSTRUCTOR, EXAMINER } =
    constants.admin.roles;
  const { STUDENT } = constants.student.roles;
  const isValidUser =
    roles.includes(ADMIN) ||
    roles.includes(MODERATOR) ||
    roles.includes(EXAM_MODERATOR) ||
    roles.includes(EXAMINER) ||
    roles.includes(STUDENT);
  if (isValidUser) {
    next();
    return;
  }
  if (roles.includes(INSTRUCTOR) && courseId) {
    // TODO: check access to exam by courseId from query string
    next();
    return;
  }
  res.forbidden({ title: "You are not allowed" });
};

const authorizeQuestionUploader = (req, res, next) => {
  const { roles } = req.user;
  const { ADMIN, MODERATOR, QUESTION_UPLOADER } = constants.admin.roles;
  const isValidUser =
    roles.includes(ADMIN) ||
    roles.includes(MODERATOR) ||
    roles.includes(QUESTION_UPLOADER);
  if (isValidUser) {
    next();
    return;
  }
  res.forbidden({ title: "You are not allowed" });
};

const authorizeQUEM = (req, res, next) => {
  const { roles } = req.user;
  const { ADMIN, MODERATOR, QUESTION_UPLOADER, EXAM_MODERATOR } =
    constants.admin.roles;
  const isValidUser =
    roles.includes(ADMIN) ||
    roles.includes(MODERATOR) ||
    roles.includes(EXAM_MODERATOR) ||
    roles.includes(QUESTION_UPLOADER);
  if (isValidUser) {
    next();
    return;
  }
  res.forbidden({ title: "You are not allowed" });
};

const authorizeContentUploader = (req, res, next) => {
  const { roles } = req.user;
  const { ADMIN, MODERATOR, CONTENT_UPLOADER } = constants.admin.roles;
  const isValidUser =
    roles.includes(ADMIN) ||
    roles.includes(MODERATOR) ||
    roles.includes(CONTENT_UPLOADER);
  if (isValidUser) {
    next();
    return;
  }
  res.forbidden({ title: "You are not allowed" });
};

const authorizeExamModerator = (req, res, next) => {
  const { roles } = req.user;
  const { ADMIN, MODERATOR, EXAM_MODERATOR } = constants.admin.roles;
  const isValidUser =
    roles.includes(ADMIN) ||
    roles.includes(MODERATOR) ||
    roles.includes(EXAM_MODERATOR);
  if (isValidUser) {
    next();
    return;
  }
  res.forbidden({ title: "You are not allowed" });
};
const authorizeEMAE = (req, res, next) => {
  // Exam moderator and examiner
  const { roles } = req.user;
  const { ADMIN, MODERATOR, EXAMINER, EXAM_MODERATOR, INSTRUCTOR } =
    constants.admin.roles;
  const isValidUser =
    roles.includes(ADMIN) ||
    roles.includes(MODERATOR) ||
    roles.includes(EXAMINER) ||
    roles.includes(EXAM_MODERATOR);

  if (isValidUser) {
    next();
    return;
  }
  if (roles.includes(INSTRUCTOR)) {
    // TODO: Check does instructor has the permission to course
    next();
    return;
  }
  res.forbidden({ title: "You are not allowed" });
};

const authorizeExaminer = (req, res, next) => {
  const { roles } = req.user;
  const { ADMIN, MODERATOR, EXAMINER } = constants.admin.roles;
  const isValidUser =
    roles.includes(ADMIN) ||
    roles.includes(MODERATOR) ||
    roles.includes(EXAMINER);
  if (isValidUser) {
    next();
    return;
  }
  res.forbidden({ title: "You are not allowed" });
};

module.exports = {
  isStudent,
  isLoggedIn,
  authorizeEMAE,
  authorizeQUEM,
  authorizeAdmin,
  authorizeSAIMEM,
  authorizeExaminer,
  authorizeModerator,
  authorizeAdminType,
  authorizeInstructor,
  authorizeQuestionUploader,
  authorizeContentUploader,
  authorizeExamModerator,
};
