const express = require("express");
const db = require('../../config/database/index')
const response = require("../../config/database/index");

const authRouter = express.Router()
authRouter.use(express.json());

authRouter.get('/:idAuth', (req, res) => {
  const sql = `SELECT * FROM auth WHERE auth_id = ${req.params?.idAuth}`

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
module.exports = authRouter