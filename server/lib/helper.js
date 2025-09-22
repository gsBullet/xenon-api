const bcrypt = require('bcrypt');
const security = require('../config/security');

const generateHashPassword = async (password) => {
  const hash = await bcrypt.hash(password, security.saltRounds);
  return hash;
};
const compareHashPassword = async (password, actualPassword) => {
  const isValidPassword = await bcrypt.compare(password, actualPassword);
  return isValidPassword;
};

module.exports = {
  generateHashPassword,
  compareHashPassword,
};
