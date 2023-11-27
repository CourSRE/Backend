const multer = require('multer')
const path = require('path')

const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/")
    },
    filename: function (_req, file, callback) {
        const fname =
          file.fieldname + "-" + Date.now() + path.extname(file.originalname);
    
        callback(null, fname);
    },
})

module.exports = profileStorage