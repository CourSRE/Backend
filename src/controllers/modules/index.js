const express = require("express");
const db = require('../../config/database/index');
const response = require("../../config/response/index");
const multer = require("multer");
const modulesStorage = require("../../config/storage/modulesStorage");
const uuid = require('uuid');

const modulesRouter = express.Router();
modulesRouter.use(express.json());

modulesRouter.get('/', (req, res) => {
  const sql = `SELECT * FROM modules`

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

const upload = multer({ storage: modulesStorage });
modulesRouter.post('/', upload.fields([{ name: 'video' }, { name: 'pdf' }]), (req, res) => {
  const { course_id, module_title, module_desc, is_optional, type } = req.body;
  const videoFiles = req.files['video'];
  const pdfFiles = req.files['pdf'];
  const videoFilenames = videoFiles ? videoFiles.map(file => file.filename) : [];
  const pdfFilenames = pdfFiles ? pdfFiles.map(file => file.filename) : [];
  const module_id = uuid.v4();
  const created_at = new Date().toISOString();
  const updated_at = new Date().toISOString();

  // Menggabungkan nama file video dan pdf menjadi satu string dengan koma sebagai pemisah
  const videoString = videoFilenames.join(',');
  const pdfString = pdfFilenames.join(',');

  // Gabungkan nama file video dan pdf ke dalam satu string
  const module_resource = `${videoString},${pdfString}`;

  const sql = `
    INSERT INTO modules 
    (module_id, course_id, module_title, module_desc, is_optional, type, module_resource, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    db.query(sql, [module_id, course_id, module_title, module_desc, is_optional, type, module_resource, created_at, updated_at], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "Invalid request" });
      }

      if (result?.affectedRows) {
        const data = {
          isSuccess: result.affectedRows,
          module_id: module_id,
        };
        return res.status(200).json({ status: "success", data, message: "Module Added Successfully" });
      }

      return res.status(500).json({ status: "error", message: "Failed to add module" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "An error occurred" });
  }
});

module.exports = modulesRouter