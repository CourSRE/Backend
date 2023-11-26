const express = require("express");
const db = require('../../config/database/index');
const response = require("../../config/response/index");

const quiz_questionsRouter = express.Router();
quiz_questionsRouter.use(express.json());

quiz_questionsRouter.get('/', (req, res) => {
  const sql = `SELECT * FROM quiz_questions`

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

module.exports = quiz_questionsRouter