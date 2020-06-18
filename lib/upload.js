const util = require("util");
const path = require("path");
const multer = require("multer");

var storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(`${__dirname}/../uploads`));
  },
  filename: (req, file, callback) => {
    const match = ["image/png", "image/jpeg", "image/jpg", "image/gif"];

    if (match.indexOf(file.mimetype) === -1) {
      var message = `${file.originalname} is invalid. Only png/jpeg/gif types accepted.`;
      return callback(message, null);
    }

    var filename = `${Date.now()}-${file.originalname}`;
    callback(null, filename);
  }
});

var uploadFiles = multer({ storage: storage }).array("bookImages", 10);
var uploadFilesMiddleware = util.promisify(uploadFiles);
module.exports = uploadFilesMiddleware;
