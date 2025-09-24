/* eslint-disable global-require */
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const cookieparser = require("cookie-parser");
const expressSession = require("express-session");
const RedisStore = require("connect-redis")(expressSession);
const cors = require("cors");
const passport = require("passport");
const mongo = require("./lib/mongoose");
const logger = require("./lib/winston");
const httpLogger = require("./middleware/httpLogger");
const response = require("./middleware/response");
const config = require("./config");
const redis = require("./lib/redis");
const cookieHandler = require("./lib/coockieHandler");
const constants = require("./constants");
require("dotenv").config();

// const service = require('./service/sender');
const app = express();
const server = http.createServer(app);
app.use(response);
app.use(cookieparser());
app.use(httpLogger);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cors({
    exposedHeaders: ["sessionId"],
  }),
);
const setupServer = async () => {
  try {
    await new Promise((resolve, reject) => {
      redis.init((err) => {
        if (err) reject(err);
        else {
          logger.info("Redis connected successfully");
          resolve();
        }
      });
    });
    const { client } = redis.getClients();

    // Message Queue using SQS
    // const queue = require('./lib/sqs');

    // Message Queue using BeeQ
    const queue = require("./lib/redis/beeQ");

    const session = expressSession({
      store: new RedisStore({ client }),
      name: config.session.name,
      secret: config.session.secret,
      resave: false,
      rolling: true,
      saveUninitialized: false,
      cookie: {
        maxAge: config.session.maxAge,
      },
    });
    app.use(cookieHandler.removeCookieForBrowser);
    app.use(cookieHandler.addSessionIdHeaderToResponse);
    app.use(cookieHandler.setCookieFromSessionId);
    app.use(session);

    await mongo.connectMongo();
    const passportSetup = require("./lib/passport");
    passportSetup.init();
    app.use(passport.initialize());
    app.use(passport.session());

    const socketIo = require("./socketIo/server");
    socketIo.init(server, session);
    const { subscribeChannel } = require("./lib/exam");
    subscribeChannel(constants.channel.START_PROCESS);
    const routes = require("./routes");

    routes.bindRoutes(app);
    const messageq = require("./lib/redis/messageq");
    messageq.init(constants.queue.AGGREGATE);
    const cron = require("./lib/cron");
    cron.init();
    // Queue from SQS
    // queue.setupWorker();
    // Queue from BeeQ
    queue.setupQueue();
    return null;
  } catch (err) {
    return Promise.reject(err);
  }
};
const message = "API is running with Xenon LMS Server ! Happy Learning. we have added new features. Check once it out. all others are same.";

app.get("/", (req, res) => res.status(200).json(message));

setupServer()
  .then(() => {
    const PORT = config.server.port || process.env.PORT;
    server.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`);
      logger.info(`http://localhost:${PORT}`);
    });
  })
  .catch((err) => logger.error(err));
