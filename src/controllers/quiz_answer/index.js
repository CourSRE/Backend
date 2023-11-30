const express = require("express");
const db = require('../../config/database/index');
const response = require("../../config/response/index");
const uuid = require("uuid");

const quiz_answersRouter = express.Router();
quiz_answersRouter.use(express.json());

quiz_answersRouter.get('/', (req, res) => {
  const sql = `SELECT * FROM quiz_answers`

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

quiz_answersRouter.post('/', (req, res) => {
  const { question_id, answer, point } = req.body;
  const answer_id = uuid.v4();

  const sql = `
    INSERT INTO quiz_answers (answer_id, question_id, answer, point) VALUES (?, ?, ?, ?)
  `;

  try {
    db.query(sql, [answer_id, question_id, answer, point], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "Invalid request" });
      }

      if (result?.affectedRows) {
        const data = {
          isSuccess: result.affectedRows,
          answer_id: result.insertId,
        };
        return res.status(200).json({ status: "success", data, message: "Answer Added Successfully" });
      }

      return res.status(500).json({ status: "error", message: "Failed to add answer" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "An error occurred" });
  }
});

quiz_answersRouter.put('/:answerId', (req, res) => {
  const answer_id = req.params.answerId;
  const { question_id, answer, point } = req.body;

  if (!answer_id) {
    return res.status(400).json({ status: "error", message: "Answer ID is required" });
  }

  // Lakukan query untuk memeriksa apakah jawaban kuis yang akan diupdate ada
  const sqlSelect = `SELECT * FROM quiz_answers WHERE answer_id = ?`;

  db.query(sqlSelect, [answer_id], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ status: "error", message: "Invalid request" });
    }

    if (!rows.length) {
      return res.status(404).json({ status: "error", message: "Answer not found" });
    }

    // Jika jawaban ditemukan, lanjutkan dengan pembaruan data
    const sqlUpdate = `
      UPDATE quiz_answers 
      SET question_id = ?, answer = ?, point = ?
      WHERE answer_id = ?
    `;

    try {
      db.query(sqlUpdate, [question_id, answer, point, answer_id], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ status: "error", message: "Invalid request" });
        }

        if (result?.affectedRows) {
          const data = {
            isSuccess: result.affectedRows,
            answer_id: answer_id,
          };
          return res.status(200).json({ status: "success", data, message: "Answer Updated Successfully" });
        }

        return res.status(500).json({ status: "error", message: "Failed to update answer" });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: "error", message: "An error occurred" });
    }
  });
});

quiz_answersRouter.delete('/:answerId', (req, res) => {
  const answer_id = req.params.answerId;

  const sqlSelect = `SELECT * FROM quiz_answers WHERE answer_id = ?`;

  // Lakukan query untuk mendapatkan data jawaban kuis yang akan dihapus
  db.query(sqlSelect, [answer_id], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ status: "error", message: "Invalid request" });
    }

    if (!rows.length) {
      return res.status(404).json({ status: "error", message: "Answer not found" });
    }

    // Jika jawaban ditemukan, lanjutkan dengan penghapusan data
    const sqlDelete = `DELETE FROM quiz_answers WHERE answer_id = ?`;

    try {
      db.query(sqlDelete, [answer_id], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ status: "error", message: "Invalid request" });
        }

        if (result?.affectedRows) {
          const data = {
            isSuccess: result.affectedRows,
            answer_id: answer_id,
          };
          return res.status(200).json({ status: "success", data, message: "Answer Deleted Successfully" });
        }

        return res.status(500).json({ status: "error", message: "Failed to delete answer" });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: "error", message: "An error occurred" });
    }
  });
});

module.exports = quiz_answersRouter