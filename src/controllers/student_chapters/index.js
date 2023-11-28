const express = require("express");
const db = require('../../config/database/index');
const response = require("../../config/response/index");
const uuid = require('uuid');

const student_chaptersRouter = express.Router();
student_chaptersRouter.use(express.json());

student_chaptersRouter.get('/:idSt', (req, res) => {
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
});

student_chaptersRouter.post('/', (req, res) => {
  const { student_chapter_name, referral_code } = req.body;

  // Pastikan bahwa student_chapter_name dan referral_code tersedia
  if (!student_chapter_name || !referral_code) {
    return res.status(400).json({ status: "error", message: "Both student_chapter_name and referral_code are required" });
  }

  const student_chapter_id = uuid.v4(); // Menggunakan uuid untuk membuat student_chapter_id
  const created_at = new Date().toISOString();
  const updated_at = new Date().toISOString();

  const sql = 'INSERT INTO student_chapters (student_chapter_id, student_chapter_name, referral_code, created_at, updated_at) VALUES (?, ?, ?, ?, ?)';
  const values = [student_chapter_id, student_chapter_name, referral_code, created_at, updated_at];

  try {
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "Invalid request" });
      }

      if (result?.affectedRows) {
        const data = {
          isSuccess: result.affectedRows,
          student_chapter_id: student_chapter_id,
        };
        response(200, data, "Data Added Successfully", res);
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "An error occurred" });
  }
});

module.exports = student_chaptersRouter