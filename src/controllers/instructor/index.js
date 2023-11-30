const express = require("express");
const db = require('../../config/database/index');
const response = require("../../config/response/index");
const uuid = require('uuid');

const instructorRouter = express.Router();
instructorRouter.use(express.json());

instructorRouter.get('/', (req, res) => {
    const sql = `SELECT * FROM instructor`

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

instructorRouter.post('/', (req, res) => {
    const { course_id, rating, instructor_desc, title } = req.body;
    const instructor_id = uuid.v4();

    const sql = `
      INSERT INTO instructor 
      (instructor_id, course_id, rating, instructor_desc, title) 
      VALUES (?, ?, ?, ?, ?)
    `;

    try {
        // Eksekusi query dengan parameter
        db.query(sql, [instructor_id, course_id, rating, instructor_desc, title], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ status: "error", message: "Invalid request" });
            }

            if (result?.affectedRows) {
                const data = {
                    isSuccess: result.affectedRows,
                    instructor_id: instructor_id,
                };
                return res.status(201).json({ status: "success", data, message: "Instructor Added Successfully" });
            }

            return res.status(500).json({ status: "error", message: "Failed to add instructor" });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "An error occurred" });
    }
});

instructorRouter.delete('/:instructorId', (req, res) => {
    const instructorId = req.params?.instructorId;
  
    if (!instructorId) {
      return res.status(400).json({ status: "error", message: "Instructor ID is required" });
    }
  
    const sql = `DELETE FROM instructor WHERE instructor_id = ?`;
  
    try {
      db.query(sql, [instructorId], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ status: "error", message: "Invalid request" });
        }
  
        if (result?.affectedRows) {
          const data = {
            isSuccess: result.affectedRows,
            instructor_id: instructorId,
          };
          return res.status(200).json({ status: "success", data, message: "Data Deleted Successfully" });
        }
  
        return res.status(404).json({ status: "error", message: "Instructor not found" });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: "error", message: "An error occurred" });
    }
  });

module.exports = instructorRouter