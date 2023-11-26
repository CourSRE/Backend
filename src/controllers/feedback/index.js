const express = require("express");
const db = require('../../config/database/index');
const response = require("../../config/response/index");

const feedbackRouter = express.Router();
feedbackRouter.use(express.json());

feedbackRouter.get('/', (req, res) => {
  const sql = `SELECT * FROM feedback`

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

module.exports = feedbackRouter