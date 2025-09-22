const Admin = require('../../server/models/Admin');
const mongoose = require('../../server/lib/mongoose');
const helper = require('../../server/lib/helper');

const createAdmin = async () => {
  try {
    const password = process.argv[2];
    if (!password) {
      console.log('\nPlease enter password\n');
      process.exit(1);
    }
    await mongoose.connectMongo();
    const hashedPassword = await helper.generateHashPassword(password);
    const admin = new Admin({
      firstName: 'Sadat',
      lastName: 'Sayem',
      email: 'sadat.talks@gmail.com',
      username: '8801521105226',
      password: hashedPassword,
      roles: ['admin'],
      verified: true,
      codeGeneratedAt: Date.now(),
      status: 'active',
      verificationCode: '12sa58a5',
      hidden: true,
    });
    const newAdmin = await admin.save();
    console.log(newAdmin);
    process.exit(1);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
createAdmin();
