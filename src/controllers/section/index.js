const express = require("express");
const db = require('../../config/database/index');
const response = require("../../config/response/index");
const uuid = require('uuid');

const sectionRouter = express.Router();
sectionRouter.use(express.json());

sectionRouter.get('/', (req, res) => {
    const sql = `SELECT * FROM section`

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

sectionRouter.post('/', (req, res) => {
    const { section_title, course_id, estimate_finish_minutes } = req.body;
    const section_id = uuid.v4();
    const created_at = new Date().toISOString();
    const updated_at = new Date().toISOString();

    const sql = `
      INSERT INTO section 
      (section_id, section_title, course_id, estimate_finish_minutes, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    try {
        db.query(sql, [section_id, section_title, course_id, estimate_finish_minutes, created_at, updated_at], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ status: "error", message: "Invalid request" });
            }

            if (result?.affectedRows) {
                const data = {
                    isSuccess: result.affectedRows,
                    section_id: section_id,
                };
                return res.status(200).json({ status: "success", data, message: "Section Added Successfully" });
            }

            return res.status(500).json({ status: "error", message: "Failed to add section" });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "An error occurred" });
    }
});

sectionRouter.put('/:sectionId', (req, res) => {
    const { section_title, course_id, estimate_finish_minutes } = req.body;
    const sectionId = req.params.sectionId;
    const updated_at = new Date().toISOString();

    const sql = `
      UPDATE section 
      SET section_title=?, course_id=?, estimate_finish_minutes=?, updated_at=?
      WHERE section_id=?
    `;

    try {
        db.query(sql, [section_title, course_id, estimate_finish_minutes, updated_at, sectionId], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ status: "error", message: "Invalid request" });
            }

            if (result?.affectedRows) {
                const data = {
                    isSuccess: result.affectedRows,
                    section_id: sectionId,
                };
                return res.status(200).json({ status: "success", data, message: "Section Updated Successfully" });
            }

            return res.status(404).json({ status: "error", message: "Section not found" });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "An error occurred" });
    }
});

sectionRouter.delete('/:sectionId', (req, res) => {
    const section_id = req.params?.sectionId;

    if (!section_id) {
        return res.status(400).json({ status: "error", message: "Section ID is required" });
    }

    const sql = `DELETE FROM section WHERE section_id = ?`;

    try {
        db.query(sql, [section_id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ status: "error", message: "Invalid request" });
            }

            if (result?.affectedRows) {
                const data = {
                    isSuccess: result.affectedRows,
                    section_id: section_id,
                };
                return res.status(200).json({ status: "success", data, message: "Section Deleted Successfully" });
            }

            return res.status(404).json({ status: "error", message: "Section not found" });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "An error occurred" });
    }
});

module.exports = sectionRouter