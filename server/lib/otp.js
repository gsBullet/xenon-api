const otpGenerator = require('otp-generator');
const crypto = require('crypto');
const config = require('../config');
const constants = require('../constants');

const createNewOTP = (phone) => {
  let otp = otpGenerator.generate(config.otp.length, {
    alphabets: false, upperCase: false, specialChars: false,
  });
 
  otp = Math.floor(Math.random() * 900000) + 100000;
  if (process.env.FIXED_OTP === 'true') {
    otp = 123321;
  }

  console.log('Sending OTP', otp);
  const { TTL, secret } = config.otp;
  const expires = Date.now() + TTL;
  const data = `${phone}.${otp}.${expires}`;
  const hash = crypto.createHmac('sha256', secret).update(data).digest('hex');
  const fullHash = `${hash}.${expires}`;
  // sendSMS(phone, `Your OTP is ${otp}. it will expire in 5 minutes`);
  return { fullHash, otp };
};

const verifyOTP = (phone, hash, otp) => {
  const { secret } = config.otp;
  const [hashValue, expires] = hash.split('.');
  const now = Date.now();
  if (now > parseInt(expires, 10)) { return { ok: false, code: constants.errors.EXPIRED }; }
  const data = `${phone}.${otp}.${expires}`;
  const newCalculatedHash = crypto.createHmac('sha256', secret).update(data).digest('hex');
  if (newCalculatedHash === hashValue) { return { ok: true }; }
  return { ok: false, code: constants.errors.INCORRECT };
};

module.exports = {
  createNewOTP,
  verifyOTP,
};
