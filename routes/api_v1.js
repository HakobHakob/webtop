const express = require("express")
const router = express.Router()
const { v4: uuidv4 } = require("uuid")
/**This middleware is typically used when you have a form that contains only textual fields and no file uploads. */
// Use multer's upload.none() middleware for handling forms with no file uploads
// const mediaController = require("../http/controllers/mediaController/mediaController")

const { userNotification } = require("../http/notifications/userNotification")
const {
  login,
  logOut,
  register,
} = require("../http/controllers/admin/userController")
const { Media } = require("../models")
const extFrom = require("../components/mimeToExt")
const { saveFileContentToPublic } = require("../components/globalFunctions")

// Group middlewares

const group = (callback) => {
  callback(router)
  return router
}

router.post("/admin/login", login)
// Create user
router.post("/admin/register", register)

router.use(
  "/admin",
  group((adminRouter) => {
    adminRouter.use((req, res, next) => {
      if (!res.locals.api_auth.admin) {
        res.status(401)
        return res.send({ status: 401, message: "Unauthorized" })
      }
      next()
    })
    adminRouter.get("/logout", logOut)
    // adminRouter.post("/register", register)
  })
)

router.post("/login", login)

// Do logout
router.get("/logout", logOut)

// Post request to send an email
router.post("/sendmail", async (req, res) => {
  const result = await userNotification(
    req.body.email,
    "subject",
    "message",
    "text"
  )
  try {
    res.json({
      status: true,
      payload: result,
    })
  } catch (error) {
    console.error(error.message)
    res.json({
      status: false,
      payload: "Something went wrong in Sendmail Route.",
    })
  }
})

// Upload file
// router.post("/profile", upload.single("avatar"), async (req, res) => {
//   try {
//     const file = req.file
//     if (file === undefined) {
//       return res.send("You must select a file.")
//     }
//     const uuidMatch = file.filename.match(/^([a-f\d]+(?:-[a-f\d]+)*)/i)
//     let uuid = uuidMatch ? uuidMatch[1] : undefined

//     /**
//      * fs.createReadStream to read the contents of the uploaded image file and fs.createWriteStream to write the contents to the destination folder. The pipe method is then used to efficiently transfer the data between the streams.
//      */
//     // const readStream = fs.createReadStream(file.path)
//     // const writeStream = fs.createWriteStream(tmpAvatarPath + file.originalname)
//     // readStream.pipe(writeStream)

//     Media.create({
//       uuid: uuid,
//       path: file.path,
//       name: file.filename,
//       mime_type: file.mimetype,
//     })
//       .then((image) => {
//         return res.send("File uploaded successfully")
//       })
//       .catch((err) => {
//         console.log(err)
//         return res.status(500).send("Error uploading file")
//       })
//   } catch (error) {
//     console.log(error)
//     return res.send(`Error when trying upload images: ${error}`)
//   }
// })

// Upload file with express-file-upload

router.post("/profile", async (req, res) => {
  let file = req.files ? req.files.avatar : null
  if (!req.files || Object.keys(req.files).length === 0) {
    res.status(400).send("No files were uploaded.")
    return
  }

  if (file) {
    const fileName = uuidv4()
    const extension = extFrom(file.mimetype, file.name)

    const uploadedFile = saveFileContentToPublic(
      "uploads/avatars",
      fileName + extension,
      file.data
    )
    if (!uploadedFile) {
      res.status(422)
      return res.send({ errors: "File not uploaded." })
    }

    Media.create({
      uuid: fileName,
      path: "uploads/avatars",
      name: file.name,
      mime_type: file.mimetype,
    })
      .then((image) => {
        return res.send("File uploaded successfully")
      })
      .catch((err) => {
        console.log(err)
        return res.status(500).send("Error uploading file")
      })
  }
})

module.exports = router
