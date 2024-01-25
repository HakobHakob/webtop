const multer = require("multer")
const path = require("path")
const { v4: uuidv4 } = require("uuid")
const { makeDirectory } = require("../../globalFunctions/globalFunctions")
const extFrom = require("../../globalFunctions/mimeToExt")

const imageFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif|webp/
  const mimetype = fileTypes.test(file.mimetype)
  const extname = fileTypes.test(path.extname(file.originalname))

  /* For all types files*/
  // const { mimetype, originalname } = file
  // const extname = extFrom(mimetype, originalname)

  if (mimetype && extname) {
    return cb(null, true)
  }
  cb("Please upload only images")
}
const avatar_path = __basedir + "/public/images/uploads/avatars"

var storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await makeDirectory(avatar_path)
    cb(null, avatar_path)
  },
  filename: (req, file, cb) => {
    const uuid = uuidv4()
    cb(null, uuid + path.extname(file.originalname))
  },
})

var uploadFile = multer({
  storage: storage,
  limits: { fileSize: "1000000" }, //Limits the maximum file size to 1,000,000 bytes (1 megabyte).
  fileFilter: imageFilter,
}).single("avatar")

module.exports = {uploadFile}
