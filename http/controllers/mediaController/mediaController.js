const multer = require("multer")
const path = require("path")
const fs = require("fs")
const { v4: uuidv4 } = require("uuid")
const { makeDirectory } = require("../../../components/globalFunctions")
const extFrom = require("../../../components/mimeToExt")

const imageFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif|webp/
  const mimetype = fileTypes.test(file.mimetype)
  const extname = fileTypes.test(path.extname(file.originalname))

  /* For all types of files*/
  // const { mimetype, originalname } = file
  // const extname = extFrom(mimetype, originalname)

  if (mimetype && extname) {
    return cb(null, true)
  }
  cb("Please upload only images")
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const avatar_path =
      __basedir + "/public/images/uploads/" + `${file.fieldname}`

    makeDirectory(avatar_path)
    cb(null, avatar_path)
  },
  filename: (req, file, cb) => {
    const uuid = uuidv4()
    cb(null, uuid + path.extname(file.originalname))
  },
})

const uploadFile = multer({
  storage,
  limits: { fileSize: "1000000" }, //Limits the maximum file size to 1,000,000 bytes (1 megabyte).
  fileFilter: imageFilter,
})

const saveFileContent = (path, fileName, fileData) => {
  try {
    let fullPath = __basedir + "/public/images/" + path
    makeDirectory(fullPath)
    fs.writeFileSync(fullPath + "/" + fileName, fileData)
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

module.exports = { uploadFile, saveFileContent }
