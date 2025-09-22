const dao = require('../data');

module.exports = {
  isLoggedIn: (req, res) => {
    res.ok(req.user);
  },
  logout: async (req, res) => {
    try {
      const user = await dao.session.getByUsername(req.user.username);
      if (user) { await dao.session.deleteByUsername(user.username, user.sessionId); }
      
      // Old style callback
      // req.logout(() => {
      //   res.ok({
      //     title: 'Logout successful',
      //   });
      // });

      await req.logout(); // No callback, use await
      res.ok({ title: 'Logout successful' });
    } catch (err) {
      res.serverError(err);
    }
  },
};
