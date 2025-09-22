const constants = require('../../constants');

module.exports = {
  removeSensitive(level) {
    const levels = Object.values(constants.sensitivityLevel);
    if (!levels.includes(level)) {
      throw new Error('Invalid sensitivity level');
    }
    const sensitiveFields = {
      server: [],
      admin: ['password'],
      appUser: ['password', 'updatedAt'],
      public: [
        'password', 'sid', 'contact', 'updatedAt', 'branch', 'HSCGPA', 'SSCGPA',
      ],
    };
    if (!this) return this;
    const plainObject = JSON.parse(JSON.stringify(this));
    sensitiveFields[level].forEach((f) => {
      delete plainObject[f];
    });
    return plainObject;
  },
};
