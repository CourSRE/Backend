const express = require("express");
const db = require('../../config/database/index');
const response = require("../../config/response/index");

const coursesRouter = express.Router();
coursesRouter.use(express.json());

coursesRouter.get('/', (req, res) => {
  const sql = `SELECT * FROM courses`

  try {
    db.query(sql, (err, fields) => {
      const data = {}
      response(200, fields, "SUCCESS", res)
    })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ status: "error", message: "An error occured" })
  }
})

module.exports = coursesRouter