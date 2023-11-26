const express = require("express");
const db = require('../../config/database/index');
const response = require("../../config/response/index");

const student_chaptersRouter = express.Router();
student_chaptersRouter.use(express.json());

student_chaptersRouter.get('/', (req, res) => {
  const sql = `SELECT * FROM student_chapters`

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

module.exports = student_chaptersRouter