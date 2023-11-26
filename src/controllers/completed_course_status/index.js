const express = require("express");
const db = require('../../config/database/index');
const response = require("../../config/response/index");

const completed_course_statusRouter = express.Router();
completed_course_statusRouter.use(express.json());

completed_course_statusRouter.get('/', (req, res) => {
  const sql = `SELECT * FROM completed_course_status`

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

module.exports = completed_course_statusRouter