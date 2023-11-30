const express = require("express");
const db = require('../../config/database/index');
const response = require("../../config/response/index");
const multer = require("multer");
const questionsStorage = require("../../config/storage/questionsStorage");
const uuid = require("uuid");

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
});

const upload = multer({ storage: questionsStorage });
quiz_questionsRouter.post('/', upload.single('attached_image'), (req, res) => {
  const { quiz_id, question } = req.body;
  const attachedImageFile = req.file;
  const attachedImageFilename = attachedImageFile ? attachedImageFile.filename : null;
  const question_id = uuid.v4();

  const sql = `
    INSERT INTO quiz_questions (question_id, quiz_id, question, attached_image) VALUES (?, ?, ?, ?)
  `;

  try {
    db.query(sql, [question_id, quiz_id, question, attachedImageFilename], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "Invalid request" });
      }

      if (result?.affectedRows) {
        const data = {
          isSuccess: result.affectedRows,
          question_id: result.insertId,
        };
        return res.status(200).json({ status: "success", data, message: "Question Added Successfully" });
      }

      return res.status(500).json({ status: "error", message: "Failed to add question" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "An error occurred" });
  }
});

quiz_questionsRouter.put('/:questionId', upload.single('attached_image'), (req, res) => {
  const question_id = req.params.questionId;
  const { quiz_id, question } = req.body;
  const attachedImageFile = req.file;
  const attachedImageFilename = attachedImageFile ? attachedImageFile.filename : null;

  const sqlSelect = `SELECT * FROM quiz_questions WHERE question_id = ?`;

  // Lakukan query untuk mendapatkan data pertanyaan kuis yang akan diubah
  db.query(sqlSelect, [question_id], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ status: "error", message: "Invalid request" });
    }

    if (!rows.length) {
      return res.status(404).json({ status: "error", message: "Question not found" });
    }

    // Jika pertanyaan ditemukan, lanjutkan dengan pembaruan data
    const existingAttachedImage = rows[0].attached_image;

    const sqlUpdate = `
      UPDATE quiz_questions 
      SET quiz_id = ?, question = ?, attached_image = ?
      WHERE question_id = ?
    `;

    try {
      db.query(sqlUpdate, [quiz_id, question, attachedImageFilename || existingAttachedImage, question_id], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ status: "error", message: "Invalid request" });
        }

        if (result?.affectedRows) {
          const data = {
            isSuccess: result.affectedRows,
            question_id: question_id,
          };
          return res.status(200).json({ status: "success", data, message: "Question Updated Successfully" });
        }

        return res.status(500).json({ status: "error", message: "Failed to update question" });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: "error", message: "An error occurred" });
    }
  });
});

quiz_questionsRouter.delete('/:questionId', (req, res) => {
  const question_id = req.params.questionId;

  const sqlSelect = `SELECT * FROM quiz_questions WHERE question_id = ?`;

  // Lakukan query untuk mendapatkan data pertanyaan kuis yang akan dihapus
  db.query(sqlSelect, [question_id], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ status: "error", message: "Invalid request" });
    }

    if (!rows.length) {
      return res.status(404).json({ status: "error", message: "Question not found" });
    }

    // Jika pertanyaan ditemukan, lanjutkan dengan penghapusan data
    const sqlDelete = `DELETE FROM quiz_questions WHERE question_id = ?`;

    try {
      db.query(sqlDelete, [question_id], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ status: "error", message: "Invalid request" });
        }

        if (result?.affectedRows) {
          const data = {
            isSuccess: result.affectedRows,
            question_id: question_id,
          };
          return res.status(200).json({ status: "success", data, message: "Question Deleted Successfully" });
        }

        return res.status(500).json({ status: "error", message: "Failed to delete question" });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: "error", message: "An error occurred" });
    }
  });
});

module.exports = quiz_questionsRouter