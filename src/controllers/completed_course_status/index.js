const express = require("express");
const db = require('../../config/database/index');
const response = require("../../config/response/index");
const uuid = require('uuid');

const completed_course_statusRouter = express.Router();
completed_course_statusRouter.use(express.json());

completed_course_statusRouter.get('/', (req, res) => {
  const sql = `SELECT * FROM completed_course_status`

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

completed_course_statusRouter.post('/', (req, res) => {
  const { user_id, course_id, status } = req.body;
  const completed_status_id = uuid.v4();
  const last_progress_at = new Date().toISOString();

  const sql = `
    INSERT INTO completed_course_status 
    (completed_status_id, user_id, course_id, status, last_progress_at) 
    VALUES (?, ?, ?, ?, ?)
  `;

  try {
    db.query(sql, [completed_status_id, user_id, course_id, status, last_progress_at], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "Invalid request" });
      }

      if (result?.affectedRows) {
        const data = {
          isSuccess: result.affectedRows,
          completed_status_id: completed_status_id,
        };
        return res.status(200).json({ status: "success", data, message: "Data Added Successfully" });
      }

      return res.status(500).json({ status: "error", message: "Failed to add data" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "An error occurred" });
  }
});

completed_course_statusRouter.delete('/:completedStatusId', (req, res) => {
  const { completedStatusId } = req.params;
  
  const sql = `DELETE FROM completed_course_status WHERE completed_status_id = ?`;

  try {
    db.query(sql, [completedStatusId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "Invalid request" });
      }

      if (result?.affectedRows) {
        const data = {
          isSuccess: result.affectedRows,
          completed_status_id: completedStatusId,
        };
        return res.status(200).json({ status: "success", data, message: "Data Deleted Successfully" });
      }

      return res.status(404).json({ status: "error", message: "Data not found" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "An error occurred" });
  }
});

module.exports = completed_course_statusRouter