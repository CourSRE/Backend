const express = require("express")
const db = require("../config/database")
const response = require("../response")

const usersRouter = express.Router()

usersRouter.use(express.json())

usersRouter.get("/profile/:idUser", (req, res) => {
  const sql = `SELECT * FROM users WHERE id_user = ${req.params?.idUser}`

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
