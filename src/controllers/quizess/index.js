const express = require("express");
const db = require('../../config/database/index');
const response = require("../../config/response/index");
const uuid = require('uuid');

const quizessRouter = express.Router();
quizessRouter.use(express.json());

quizessRouter.get('/', (req, res) => {
  const sql = `SELECT * FROM quizess`

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

quizessRouter.post('/', (req, res) => {
  const { module_id, quiz_title, quiz_desc, strict_level } = req.body;

  if (!module_id || !quiz_title || !quiz_desc || strict_level === undefined) {
    return res.status(400).json({ status: "error", message: "Incomplete data. Please provide module_id, quiz_title, quiz_desc, and strict_level" });
  }

  const quiz_id = uuid.v4();
  const created_at = new Date().toISOString();
  const updated_at = new Date().toISOString();

  const sql = `
    INSERT INTO quizess 
    (quiz_id, module_id, quiz_title, quiz_desc, strict_level, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    db.query(sql, [quiz_id, module_id, quiz_title, quiz_desc, strict_level, created_at, updated_at], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "Invalid request" });
      }

      if (result?.affectedRows) {
        const data = {
          isSuccess: result.affectedRows,
          quiz_id: quiz_id,
        };
        return res.status(200).json({ status: "success", data, message: "Quiz Added Successfully" });
      }

      return res.status(500).json({ status: "error", message: "Failed to add quiz" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "An error occurred" });
  }
});

quizessRouter.put('/:quizId', (req, res) => {
  const { module_id, quiz_title, quiz_desc, strict_level } = req.body;
  const quizId = req.params.quizId;
  const updated_at = new Date().toISOString();

  const sql = `
    UPDATE quizess 
    SET module_id=?, quiz_title=?, quiz_desc=?, strict_level=?, updated_at=?
    WHERE quiz_id=?
  `;

  try {
    db.query(sql, [module_id, quiz_title, quiz_desc, strict_level, updated_at, quizId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "Invalid request" });
      }

      if (result?.affectedRows) {
        const data = {
          isSuccess: result.affectedRows,
          quiz_id: quizId,
        };
        return res.status(200).json({ status: "success", data, message: "Quiz Updated Successfully" });
      }

      return res.status(404).json({ status: "error", message: "Quiz not found" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "An error occurred" });
  }
});

quizessRouter.delete('/:quizId', (req, res) => {
  const quizId = req.params.quizId;

  const sql = `DELETE FROM quizess WHERE quiz_id = ?`;

  try {
    db.query(sql, [quizId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "Invalid request" });
      }

      if (result?.affectedRows) {
        const data = {
          isSuccess: result.affectedRows,
          quiz_id: quizId,
        };
        return res.status(200).json({ status: "success", data, message: "Quiz Deleted Successfully" });
      }

      return res.status(404).json({ status: "error", message: "Quiz not found" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "An error occurred" });
  }
});

module.exports = quizessRouter