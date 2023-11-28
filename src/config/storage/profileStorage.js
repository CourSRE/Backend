const multer = require('multer');
const path = require('path');

const profileStorage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const uploadPath = path.join("public", "profile_images");
    
    // Check if the folder exists, and create it if not
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (_req, file, callback) {
    const fname = "profile-" + Date.now() + path.extname(file.originalname);
    callback(null, fname);
  },
});

module.exports = profileStorage;
