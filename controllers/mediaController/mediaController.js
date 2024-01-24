const multer = require("multer")
const path = require("path")
const { v4: uuidv4 } = require("uuid")
const {
  makeDirectoryIfNotExists,
} = require("../../globalFunctions/globalFunctions")

const imageFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif|webp/
  const mimetype = fileTypes.test(file.mimetype)
  const extname = fileTypes.test(path.extname(file.originalname))

  if (mimetype && extname) {
    return cb(null, true)
  }
  cb("Please upload only images")
}

const avatar_path = __basedir + "/public/images/uploads/avatars/"
makeDirectoryIfNotExists(avatar_path)

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatar_path)
  },
  filename: (req, file, cb) => {
    const uuid = uuidv4()
    cb(null, uuid + path.extname(file.originalname))
  },
})

const uploadFile = multer({
  storage: storage,
  limits: { fileSize: "1000000" }, //Limits the maximum file size to 1,000,000 bytes (1 megabyte).
  fileFilter: imageFilter,
}).single("avatar")

module.exports = { uploadFile }
