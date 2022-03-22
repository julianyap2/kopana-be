const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "public/images",
  filename: function (req, file, cb) {
    if (file.fieldname === "imageKelengkapanSarana") {
      cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
    } else if (file.fieldname === "imageSuratTeraTimbangan") {
      cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
    } else if (file.fieldname === "imageKeteranganUsaha") {
      cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
    } else if (file.fieldname === "imageKtp") {
      cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
    } else if (file.fieldname === "fotoProfile") {
      cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
    } else if (file.fieldname === "galery") {
      cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
    } else {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  },
});

const uploadSingle = multer({
  storage: storage,
  // limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).fields([
  { name: "imageKelengkapanSarana", maxCount: 1 },
  { name: "imageSuratTeraTimbangan", maxCount: 1 },
  { name: "imageKeteranganUsaha", maxCount: 1 },
  { name: "imageKtp", maxCount: 1 },
  { name: "fotoProfile", maxCount: 1 },
]);

const uploadSingleFix = multer({
  storage: storage,
  // limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("galery");

const uploadMultiple = multer({
  storage: storage,
  // limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).array("galery");

function checkFileType(file, cb) {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);
  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb("Error: Images Only !!!");
  }
}
module.exports = { uploadSingle, uploadMultiple, uploadSingleFix };
