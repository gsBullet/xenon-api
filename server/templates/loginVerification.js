const template = ({ name, code }) => {
  const temp = `
  <h1> Hello ${name} </h1>
  Your verification code is :${code}`;
  return temp;
};
module.exports = { template };
