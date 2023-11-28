const express = require("express");
const db = require('../../config/database/index');
const response = require("../../config/response/index");
const uuid = require('uuid');

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
});

feedbackRouter.post('/', (req, res) => {
  const { course_id, rating, feedback } = req.body;
  const feedback_id = uuid.v4();
  const created_at = new Date().toISOString();

  const sql = `
    INSERT INTO feedback 
    (feedback_id, course_id, rating, feedback, created_at) 
    VALUES (?, ?, ?, ?, ?)
  `;

  try {
    db.query(sql, [feedback_id, course_id, rating, feedback, created_at], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "Invalid request" });
      }

      if (result?.affectedRows) {
        const data = {
          isSuccess: result.affectedRows,
          feedback_id: feedback_id,
        };
        return res.status(200).json({ status: "success", data, message: "Feedback Added Successfully" });
      }

      return res.status(500).json({ status: "error", message: "Failed to add feedback" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "An error occurred" });
  }
});

feedbackRouter.delete('/:feedback_id', (req, res) => {
  const feedback_id = req.params.feedback_id;

  const sql = `
    DELETE FROM feedback 
    WHERE feedback_id = ?
  `;

  try {
    db.query(sql, [feedback_id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "Invalid request" });
      }

      if (result?.affectedRows) {
        const data = {
          isSuccess: result.affectedRows,
          feedback_id: feedback_id,
        };
        return res.status(200).json({ status: "success", data, message: "Feedback Deleted Successfully" });
      }

      return res.status(404).json({ status: "error", message: "Feedback not found" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "An error occurred" });
  }
});

module.exports = feedbackRouter