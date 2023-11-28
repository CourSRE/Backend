const express = require("express");
const db = require('../../config/database/index');
const response = require("../../config/response/index");
const multer = require("multer");
const coursesStorage = require("../../config/storage/coursesStorage");
const uuid = require('uuid');

const coursesRouter = express.Router();
coursesRouter.use(express.json());

coursesRouter.get('/', (req, res) => {
  const sql = `SELECT * FROM courses`

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

coursesRouter.get('/:idCourse', (req, res) => {
  const { idCourse } = req.params
  const sql = `SELECT * FROM courses WHERE course_id = "${idCourse}"`

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

const upload = multer({ storage: coursesStorage });
coursesRouter.post('/', upload.single('course_picture'), (req, res) => {
  const { course_title, course_desc, estimate_finish_minutes, expertise } = req.body;
  const imageFile = req.file;
  const imageFilename = imageFile ? imageFile.filename : null;
  const course_id = uuid.v4();
  const created_at = new Date().toISOString();
  const updated_at = new Date().toISOString();

  const sql = `
    INSERT INTO courses 
    (course_id, course_title, course_desc, estimate_finish_minutes, expertise, course_picture, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    db.query(sql, [course_id, course_title, course_desc, estimate_finish_minutes, expertise, imageFilename, created_at, updated_at], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "Invalid request" });
      }

      if (result?.affectedRows) {
        const data = {
          isSuccess: result.affectedRows,
          course_id: course_id,
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

coursesRouter.put('/:idCourse', upload.single('course_picture'), (req, res) => {
  const { idCourse } = req.params;
  const { course_title, course_desc, estimate_finish_minutes, expertise } = req.body;
  const imageFile = req.file;
  const imageFilename = imageFile ? imageFile.filename : null;
  const updated_at = new Date().toISOString();

  const sql = `
    UPDATE courses 
    SET course_title=?, course_desc=?, estimate_finish_minutes=?, expertise=?, updated_at=?
    ${imageFilename ? ', course_picture=?' : ''}
    WHERE course_id=?
  `;

  try {
    const params = [course_title, course_desc, estimate_finish_minutes, expertise, updated_at];
    
    if (imageFilename) {
      params.push(imageFilename);
    }

    params.push(idCourse);

    db.query(sql, params, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "Invalid request" });
      }

      if (result?.affectedRows) {
        const data = {
          isSuccess: result.affectedRows,
          course_id: idCourse,
        };
        return res.status(200).json({ status: "success", data, message: "Data Updated Successfully" });
      }

      return res.status(404).json({ status: "error", message: "Course not found" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "An error occurred" });
  }
});

coursesRouter.delete('/:idCourse', (req, res) => {
  const { idCourse } = req.params;

  const sql = `DELETE FROM courses WHERE course_id = ?`;

  try {
    db.query(sql, [idCourse], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "Invalid request" });
      }

      if (result?.affectedRows) {
        const data = {
          isSuccess: result.affectedRows,
          course_id: idCourse,
        };
        return res.status(200).json({ status: "success", data, message: "Data Deleted Successfully" });
      }

      return res.status(404).json({ status: "error", message: "Course not found" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "An error occurred" });
  }
});

module.exports = coursesRouter