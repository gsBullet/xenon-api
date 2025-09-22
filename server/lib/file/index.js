const convertCsvToXlsx = require('@aternus/csv-to-xlsx');
const Promise = require('bluebird');
const XlsxPopulate = require('xlsx-populate');
const config = require('../../config');

const logger = require('../winston');

XlsxPopulate.Promise = Promise;

const encrypt = async (source, destination) => {
  try {
    convertCsvToXlsx(source, destination);
    const workbook = await XlsxPopulate.fromFileAsync(destination);
    await workbook.toFileAsync(destination, { password: config.security.encryptionKey });
    return 'done';
  } catch (err) {
    logger.error(err);
    return Promise.reject(err);
  }
};
module.exports = { encrypt };
