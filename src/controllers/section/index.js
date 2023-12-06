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

sectionRouter.get('/:sectionId', (req, res) => {
    const query = `
      SELECT
        c.course_id,
        c.course_title,
        c.course_desc,
        c.long_desc,
        c.estimate_finish_minutes,
        c.expertise,
        c.course_picture,
        s.section_id,
        s.section_title,
        m.module_id,
        m.module_title,
        m.module_desc,
        m.is_optional,
        m.type,
        m.module_resource
      FROM
        courses c
      LEFT JOIN
        section s ON c.course_id = s.course_id
      LEFT JOIN
        modules m ON s.section_id = m.section_id
      WHERE
        s.section_id = ?;
    `;

    const sectionId = req.params.sectionId;

    db.query(query, [sectionId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
        } else {
            if (result.length === 0) {
                res.status(404).send('Section not found');
            } else {
                const course = {
                    course_id: result[0].course_id,
                    course_title: result[0].course_title,
                    course_desc: result[0].course_desc,
                    long_desc: result[0].long_desc,
                    estimate_finish_minutes: result[0].estimate_finish_minutes,
                    expertise: result[0].expertise,
                    course_picture: result[0].course_picture,
                    sections: result.map((row) => ({
                        section_id: row.section_id,
                        section_title: row.section_title,
                        modules: result.map((row) => ({
                            module_id: row.module_id,
                            module_title: row.module_title,
                            module_desc: row.module_desc,
                            is_optional: row.is_optional,
                            type: row.type,
                            module_resource: row.module_resource,
                        })),
                    })),
                };

                res.json(course);
            }
        }
    });
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