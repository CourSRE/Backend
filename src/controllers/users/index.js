const express = require("express")
const db = require('../../config/database/index');
const response = require("../../config/response/index");

const usersRouter = express.Router()
usersRouter.use(express.json());


usersRouter.use(express.json())

usersRouter.get("/profile/:idUser", (req, res) => {
  const sql = `SELECT * FROM users WHERE user_id = ${req.params?.idUser}`

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

module.exports = usersRouter