const multer = require('multer');
const path = require('path');

const coursesStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fileType = getFileType(file);
    const uploadPath = path.join("public", fileType);
    cb(null, uploadPath);
  },
  filename: function (req, file, callback) {
    const fileExtension = path.extname(file.originalname);
    const fname = "course-" + Date.now() + fileExtension;
    callback(null, fname);
  },
});

function getFileType(file) {
    if (file.fieldname === 'course_picture') {
      return 'course_images';
    }
    return null;
  }

module.exports = coursesStorage;
