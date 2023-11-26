const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createConnection({
    connection: process.env.DB_CONNECTION,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
});

connection.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err)
      return;
    }
    console.log('Connected to the database')
  });

module.exports = connection;