require('dotenv').config();

const secretKey = process.env.JWT_SECRET_KEY;

module.exports = {
  secretKey
};