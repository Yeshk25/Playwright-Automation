const crypto = require('crypto');

const now = new Date();

const executionFolder =
  `Run_${
    now.getFullYear()
  }-${
    String(now.getMonth() + 1).padStart(2, '0')
  }-${
    String(now.getDate()).padStart(2, '0')
  }_${
    String(now.getHours()).padStart(2, '0')
  }-${
    String(now.getMinutes()).padStart(2, '0')
  }-${
    String(now.getSeconds()).padStart(2, '0')
  }_${process.pid}-${crypto.randomBytes(4).toString('hex')}`;

module.exports = executionFolder;
