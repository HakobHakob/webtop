const express = require("express")
const router = express.Router()
const fs = require("fs")
const { Media, User } = require("../models")
const { uploadFile } = require("../controllers/mediaController/mediaController")
const { makeDirectory } = require("../globalFunctions/globalFunctions")
const { authenticateUser } = require("../middlewares/authenticateUser ")

router.get("/profile", async (req, res, next) => {
  res.status(422)
  return res.send({ errors: "Err" })
})

router.post("/profile", uploadFile, async (req, res) => {
  const { email } = req.body
  const user = await User.findOne({ where: { email: email } })

  try {
    const file = req.file
    if (file === undefined) {
      return res.send("You must select a file.")
    }
    const tmpAvatarPath = __basedir + "/public/images/uploads/tmp/"
    const uuidMatch = file.filename.match(/^([a-f\d]+(?:-[a-f\d]+)*)/i)
    let uuid = uuidMatch ? uuidMatch[1] : undefined
    await makeDirectory(tmpAvatarPath)

    /**
     * fs.createReadStream to read the contents of the uploaded image file and fs.createWriteStream to write the contents to the destination folder. The pipe method is then used to efficiently transfer the data between the streams.
     */
    const readStream = fs.createReadStream(file.path)
    const writeStream = fs.createWriteStream(tmpAvatarPath + file.originalname)
    readStream.pipe(writeStream)

    Media.create({
      uuid: uuid,
      path: file.path,
      name: file.filename,
      mime_type: file.mimetype,
    })
      .then((image) => {
        return res.send("File uploaded successfully")
      })
      .catch((err) => {
        console.log(err)
        return res.status(500).send("Error uploading file")
      })
  } catch (error) {
    console.log(error)
    return res.send(`Error when trying upload images: ${error}`)
  }
})

module.exports = router
