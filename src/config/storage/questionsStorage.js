const multer = require('multer');
const path = require('path');

const questionsStorage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const uploadPath = path.join("public", "qQuestion_images");

    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (_req, file, callback) {
    const fileExtension = path.extname(file.originalname);
    const fname = "quiz-" + Date.now() + fileExtension;
    callback(null, fname);
  },
});

module.exports = questionsStorage;

