const logger = require("../lib/winston");
const adminRoutes = require("./admin");
const authRoutes = require("./auth");
const courseRoutes = require("./course");
const branchRoutes = require("./branch");
const studentRoutes = require("./student");
const groupRoutes = require("./group");
const subjectRoutes = require("./subject");
const lectureRoutes = require("./lecture");
const chapterRoutes = require("./chapter");
const contentRoutes = require("./content");
const questionRoutes = require("./question");
const notificationRoutes = require("./notification");
const examRoutes = require("./exam");
const fileRoutes = require("./file");
const analitycsRoutes = require("./analitycs");
const gatewayRoutes = require("./gateway");
const questionSolveRoutes = require("./questionSolve");
const qaRoutes = require("./qa");
const dummyRoutes = require("./dummy");
const constants = require("../constants");
const analitycs = require("../data/impl/redis/analitycs");

const bindRoutes = (app) => {
  app.use((err, req, res, next) => {
    if (err && err === constants.errors.NOT_ACTIVE) req.logout();
    next();
  });
  app.use((req, res, next) => {
    console.log(req.path);
    try {
      if (!req.path.includes("health")) {
        analitycs.incrementRequestCount();
      }
    } catch (err) {
      console.log(err);
    }
    next();
  });
  app.get("/health", (req, res) => {
    res.ok({
      message: "Health check is OK",
      version: constants.VERSION,
    });
  });
  app.use("/api/question-solve/", questionSolveRoutes);
  app.use("/api/gateway/", gatewayRoutes);
  app.use("/api/analitycs/", analitycsRoutes);
  app.use("/api/file/", fileRoutes);
  app.use("/api/notification/", notificationRoutes);
  app.use("/api/exam/", examRoutes);
  app.use("/api/question/", questionRoutes);
  app.use("/api/auth/", authRoutes);
  app.use("/api/admin/", adminRoutes);
  app.use("/api/course/", courseRoutes);
  app.use("/api/branch/", branchRoutes);
  app.use("/api/content/", contentRoutes);
  app.use("/api/chapter/", chapterRoutes);
  app.use("/api/lecture/", lectureRoutes);
  app.use("/api/subject/", subjectRoutes);
  app.use("/api/group/", groupRoutes);
  app.use("/api/student/", studentRoutes);
  app.use("/api/qa/", qaRoutes);
  app.get("/loaderio-39c518e41bd10049b64343a3e88579a9", (req, res) => {
    res.send("loaderio-39c518e41bd10049b64343a3e88579a9");
  });
  logger.info("Routes bound successfully");
  app.use((req, res) => {
    logger.warn(`access to undefined route: ${req.url}`);
    res.notFound({ message: "no such route" });
  });
};

module.exports = { bindRoutes };
