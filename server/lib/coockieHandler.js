const onHeaders = require("on-headers");
const config = require("../config");

const removeCookieForBrowser = (req, res, next) => {
  if (req.headers.agent === "browser") {
    onHeaders(res, function () {
      this.removeHeader("set-cookie");
      this.removeHeader("Set-Cookie");
    });
  }
  next();
};

const setCookieFromSessionId = (req, res, next) => {
  const sessionId = req.headers.authorization;
  console.log("setCookieFromSessionId sessionId", sessionId);
  if (sessionId) {
    const cookie = `${config.session.name}=${sessionId}`;
    if (!req.headers.cookie) req.headers.cookie = cookie;
    else req.headers.cookie = `${req.headers.cookie}; ${cookie}`;
  }
  next();
};
const setCookieFromQuery = (req, res, next) => {
  const { sessionId } = req.query;
  if (sessionId) {
    const cookie = `${config.session.name}=${sessionId}`;
    if (!req.headers.cookie) req.headers.cookie = cookie;
    else req.headers.cookie = `${req.headers.cookie}; ${cookie}`;
  }
  next();
};
const addSessionIdHeaderToResponse = (req, res, next) => {
  onHeaders(res, function () {
    const cookies =
      this.getHeader("Set-Cookie") || this.getHeader("set-cookie");
    if (cookies) {
      const sessionName = config.session.name;
      cookies.forEach((cookie) => {
        const [cookieValue] = cookie.split(";");
        if (cookieValue.startsWith(sessionName)) {
          const sid = cookieValue.substr(sessionName.length + 1);
          this.setHeader("sessionId", sid);
        }
      });
    }
  });
  next();
};
module.exports = {
  setCookieFromQuery,
  removeCookieForBrowser,
  setCookieFromSessionId,
  addSessionIdHeaderToResponse,
};
