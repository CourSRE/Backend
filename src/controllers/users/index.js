const express = require("express")
const db = require('../../config/database/index');
const response = require("../../config/response/index");
const multer = require("multer");
const profileStorage = require("../../config/storage/profileStorage");
const uuid = require('uuid');

const usersRouter = express.Router()
usersRouter.use(express.json());


usersRouter.use(express.json())

usersRouter.get("/profile/:idUser", (req, res) => {
  const sql = `SELECT * FROM users WHERE user_id = "${req.params?.idUser}"`

  try {
    db.query(sql, [encodedIdUser], (err, fields) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ status: "error", message: "An error occurred" });
      }

      const data = {};
      response(200, fields, "SUCCESS", res);
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "An error occurred" });
  }
});

const upload = multer({ storage: profileStorage });
usersRouter.post("/profile", upload.single("profile_picture"), (req, res) => {
  const { fullname, role, title, birthday, gender, auth_id, student_chapter_id } = req.body;

  if (!fullname || !role || !auth_id || !student_chapter_id) {
    return res
      .status(400)
      .json({ status: "error", message: "Incomplete request data" });
  }

  const user_id = uuid.v4();
  const filename = req.file?.filename || "";
  const created_at = new Date().toISOString();
  const updated_at = new Date().toISOString();

  const sql = `
    INSERT INTO users (user_id, fullname, profile_picture, role, title, birthday, gender, auth_id, student_chapter_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    user_id,
    fullname,
    filename,
    role,
    title,
    birthday,
    gender,
    auth_id,
    student_chapter_id,
    created_at,
    updated_at,
  ];

  try {
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ status: "error", message: "Invalid request" });
      }

      if (result?.affectedRows) {
        const data = {
          isSuccess: result.affectedRows,
          user_id: user_id,
        };
        return res.status(200).json({
          status: "success",
          data,
          message: "Data Added Successfully",
        });
      }
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "An error occurred" });
  }
});

usersRouter.put("/profile/:idUser", upload.single("profile_picture"), (req, res) => {
  const user_id = req.params?.idUser;
  const { fullname, role, title, birthday, gender } = req.body;
  const filename = req.file?.filename || "";
  const updated_at = new Date().toISOString();

  let sql;
  let values;

  if (filename) {
    // Update both fullname, role, and profile_picture
    sql = `UPDATE users SET fullname = ?, profile_picture = ?, role = ?, title = ?, birthday = ?, gender = ?, updated_at = ? WHERE user_id = ?`;
    values = [fullname, filename, role, title, birthday, gender, updated_at, user_id];
  } else {
    // Update only fullname and role, leave profile_picture unchanged
    sql = `UPDATE users SET fullname = ?, role = ?, title = ?, birthday = ?, gender = ?, updated_at = ? WHERE user_id = ?`;
    values = [fullname, role, title, birthday, gender, updated_at, user_id];
  }

  try {
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "Invalid request" });
      }
      if (result.affectedRows > 0) {
        const data = {
          isSuccess: true,
          message: "Update Data Successfully",
        };
        return res.status(200).json(data);
      } else {
        return res.status(404).json({ status: "error", message: "User not found" });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "An error occurred" });
  }
});


usersRouter.delete("/profile", (req, res) => {
  const { user_id } = req.body;
  const sql = 'DELETE FROM users WHERE user_id = ?';

  try {
    db.query(sql, [user_id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "An error occurred" });
      }

      if (result?.affectedRows > 0) {
        const data = {
          isDeleted: result.affectedRows,
        };
        return res.status(200).json({ status: "success", data, message: "Data Deleted Successfully" });
      } else {
        return res.status(404).json({ status: "error", message: "User not found" });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "An error occurred" });
  }
});

module.exports = usersRouter