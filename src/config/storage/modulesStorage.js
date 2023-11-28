const multer = require('multer');
const path = require('path');

const modulesStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fileType = getFileType(file);
    const uploadPath = path.join("public", "module_resource", fileType);
    cb(null, uploadPath);
  },
  filename: function (req, file, callback) {
    const fileExtension = path.extname(file.originalname);
    const fname = "module-" + Date.now() + fileExtension;
    callback(null, fname);
  },
});

function getFileType(file) {
  const extname = path.extname(file.originalname).toLowerCase();

  if (extname === '.pdf') {
    return 'pdf';
  } else if (extname === '.mp4' || extname === '.avi' || extname === '.mkv') {
    return 'video';
  } else {
    return 'other';
  }
}

module.exports = modulesStorage;
