const { DB } = require("../../../components/db")
const moment = require("moment/moment")
const { v4: uuidv4 } = require("uuid")
const { api_validate, teamScheme } = require("../../../components/validate")
const extFrom = require("../../../components/mimeToExt")
const {
  saveFileContentToPublic,
} = require("../../../components/globalFunctions")
const { generateString } = require("../../../components/functions")

const teamsControllerIndex = async (req, res, next) => {
  return res.send({ message: "teamsControllerIndex" })
}

const teamsControllerCreate = async (req, res, next) => {
  const scheme = teamScheme()
  let valid_err = api_validate(scheme, req, res)

  if (valid_err) {
    res.status(422)
    return res.send({ errors: valid_err })
  }

  let locale = res.locals.api_local
  let { firstName, lastName, rank, title, description, active } = req.body
  let { image, images } = req.files ?? { image: null, images: null }

  let teamData = { firstName, lastName }
  if (rank) teamData.rank = JSON.stringify({ [locale]: rank })
  if (title) teamData.title = JSON.stringify({ [locale]: title })
  if (description)
    teamData.description = JSON.stringify({ [locale]: description })

  try {
    if (image && !Array.isArray(image)) {
      let imageName = uuidv4() + generateString(4)
      let ext = extFrom(image.mimetype, image.name)
      if (ext.toLowerCase() !== ".png" && ext.toLowerCase() !== ".jpg") {
        res.status(422)
        return res.send({ errors: "image not a jpg or png." })
      }
      let uploaded = saveFileContentToPublic(
        "images/uploads/teams",
        imageName + ext,
        image.data
      )
      if (!uploaded) {
        res.status(422)
        return res.send({ errors: "Image not uploaded." })
      }
      image = "images/uploads/teams/" + imageName + ext
      teamData.image = image
    }
    if (images && !Array.isArray(images)) {
      images = [images]
    }
    teamData.images = []
    for (let img of images ?? []) {
      let imageName = uuidv4() + generateString(4)
      let ext = extFrom(img.mimetype, img.name)
      if (ext.toLowerCase() !== ".png" && ext.toLowerCase() !== ".jpg") {
        res.status(422)
        return res.send({ errors: "image not a jpg or png." })
      }
      let uploaded = saveFileContentToPublic(
        "images/uploads/teams",
        imageName + ext,
        img.data
      )
      if (!uploaded) {
        res.status(422)
        return res.send({ errors: "image not uploaded." })
      }
      image = "images/uploads/teams/" + imageName + ext
      teamData.images.push(image)
    }
    if (teamData.images.length < 1) {
      delete teamData.images
    } else {
      teamData.images = JSON.stringify(teamData.images)
    }
    teamData.created_at = moment().format("yyyy-MM-DD HH:mm:ss")
    teamData.updated_at = moment().format("yyyy-MM-DD HH:mm:ss")
    await DB("teams").create(teamData)
  } catch (e) {
    console.error(e)
    res.status(422)
    return res.send({ errors: "Team not created." })
  }

  return res.send({
    data: {},
    message: "Team created successfully.",
    errors: {},
  })
}

const teamsControllerStore = async (req, res, next) => {
  //
}

const teamsControllerShow = async (req, res, next) => {
  //
}

const teamsControllerEdit = async (req, res, next) => {
  //
}

const teamsControllerUpdate = async (req, res, next) => {
  //
}

const teamsControllerDestroy = async (req, res, next) => {
  //
}

module.exports = {
  teamsControllerIndex,
  teamsControllerCreate,
  teamsControllerStore,
  teamsControllerShow,
  teamsControllerEdit,
  teamsControllerUpdate,
  teamsControllerDestroy,
}
