const {
  api_validate,
  registrationSchema,
  loginScheme,
  unique,
  userUpdateScheme,
} = require("../../../components/validate")
const { User } = require("../../../models")
const bcrypt = require("bcrypt")
const { DB } = require("../../../components/db")
const { v4: uuidv4 } = require("uuid")

const moment = require("moment/moment")
const fs = require("node:fs")
const {
  saveAndGetUserToken,
  apiLogoutUser,
  generateString,
} = require("../../../components/functions")
const { userNotification } = require("../../notifications/userNotification")
const userResource = require("../../resources/userResource")
const { apiErrors } = require("../../../components/util")
const extFrom = require("../../../components/mimeToExt")
const {
  saveFileContentToPublic,
  handleImageUpload,
} = require("../../../components/globalFunctions")

/**
 * verify, is admin logged in
 * @returns true|false
 */
const logged = async (req, res, next) => {
  let loggedIn = !!res.locals.api_auth.admin
  return res.send({ logged: loggedIn })
}

const login = async (req, res, next) => {
  req.session.errors = req.session.errors || {}
  const scheme = loginScheme()
  const validation_error = api_validate(scheme, req, res)
  if (validation_error) {
    for (const errKey in apiErrors) {
      for (const valid_err_key in validation_error) {
        if (errKey === valid_err_key) {
          req.session.errors[errKey] = apiErrors[errKey]
        }
      }
    }
    res.status(422)
    return res.send({ errors: req.session.errors })
  }

  const { email, password } = req.body
  let user = null
  try {
    user = await DB("Users").where("email", email).first()
  } catch (e) {
    console.error(e)
  }

  if (user) {
    // user.dataValues.password
    if (!bcrypt.compareSync(password, user.password)) {
      res.status(422)
      return res.send({ errors: req.session.errors["password"] })
    }
  } else {
    res.status(422)
    return res.send({ errors: req.session.errors["email"] })
  }
  // user.dataValues.id
  const token = await saveAndGetUserToken(user.id, "admin")

  // { user: userResource(user), token }
  return res.send({ user: userResource(user), token })
}

const logOut = async (req, res, next) => {
  let logout = false

  if (res.locals.api_auth.admin) {
    logout = await apiLogoutUser(
      res.locals.api_auth.admin.dataValues.id,
      "admin",
      req,
      res
    )
  }

  if (logout) {
    return res.send({ message: "Logged out successfully." })
  }
  // res.redirectBack()
  res.status(422)
  return res.send({ errors: "Not logged out." })
}

const register = async (req, res, next) => {
  const uniqueErr = await unique("users", "email", req.body.email)
  if (uniqueErr) {
    res.status(422)
    return res.send({ errors: { email: uniqueErr } })
  }
  req.session.errors = req.session.errors || {}
  const schema = registrationSchema()
  const validation_error = api_validate(schema, req, res)

  if (validation_error) {
    for (const errKey in apiErrors) {
      for (const valid_err_key in validation_error) {
        if (errKey === valid_err_key) {
          req.session.errors[errKey] = apiErrors[errKey]
        }
      }
    }
    res.status(422)
    return res.send({ errors: req.session.errors })
  }

  let message = null,
    generatedPassword = null
  if (!req.body.role) {
    req.body.role = "admin"
  }
  if (!req.body.password) {
    generatedPassword = req.body.password = generateString(10)
    message = "User password generated automatically, it send to email."
  }
  const { firstName, lastName, email, password } = req.body

  const newUser = await User.create({
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
    role: "admin",
    emailVerifyedAt: new Date(),
  })
  await userNotification(
    email,
    "User created",
    '<div style="font-size: 35px;color: #077">Hello, You are registered in WebTop, your password: ' +
      password +
      "</div>",
    "html"
  )
  return res.send({ user: newUser, message, generatedPassword })
}

const createEmployee = async (req, res, next) => {
  const uniqueErr = await unique("users", "email", req.body.email)
  if (uniqueErr) {
    res.status(422)
    return res.send({ errors: { email: uniqueErr } })
  }
  req.session.errors = req.session.errors || {}
  const schema = registrationSchema()
  const validation_error = api_validate(schema, req, res)

  if (validation_error) {
    res.status(422)
    return res.send({ errors: validation_error })
  }

  let message = null,
    generatedPassword = null
  if (!req.body.role) {
    req.body.role = "admin"
  }
  if (!req.body.password) {
    generatedPassword = req.body.password = generateString(10)
    message = "User password generated automatically, it send to email."
  }

  // Handle user photo upload
  let userPhoto = req.files ? req.files.image : null
  let photo = null

  if (userPhoto) {
    try {
      const userPhotoPath = "storage/uploads/usersAvatar"
      photo = await handleImageUpload(userPhoto, 0, userPhotoPath)
    } catch (error) {
      res.status(422)
      return res.send({ errors: error.message })
    }
  }

  // Handle user images upload
  let images = req.files ? req.files.images : null
  let imagesJson = null
  let userImages = {}
  if (images) {
    const userPhotoPath = "storage/uploads/usersImages"
    try {
      await Promise.all(
        images.map(async (image, index) => {
          const imageName = await handleImageUpload(image, index, userPhotoPath)
          const key = "Image_" + index
          userImages[key] = imageName
        })
      )
      imagesJson = JSON.stringify(userImages)
    } catch (error) {
      res.status(422)
      return res.send({ errors: error.message })
    }
  }

  let newUserData = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    image: photo,
    images: imagesJson,
    rank: req.body.rank,
    title: req.body.title,
    description: req.body.description,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    emailVerifyedAt: moment().format("yyyy-MM-DD HH:mm:ss"),
    createdAt: moment().format("yyyy-MM-DD HH:mm:ss"),
    updatedAt: moment().format("yyyy-MM-DD HH:mm:ss"),
  }

  const { email, password } = req.body

  try {
    await DB("employees").create(newUserData)
  } catch (e) {
    console.error(e)
    res.status(422)
    return res.send({ errors: "User not created." })
  }
  await userNotification(
    email,
    "User created",
    '<div style="font-size: 35px;color: #077">Hello, You are registered in WebTop, your password: ' +
      password +
      "</div>",
    "html"
  )
  return res.send({ user: newUserData, message, generatedPassword })
}

const update = async (req, res, next) => {
  req.session.errors = req.session.errors || {}
  let { user_id } = req.params
  let user = null
  if (!user_id) {
    res.status(422)
    return res.send({ errors: "No user id parameter." })
  }
  const scheme = userUpdateScheme()
  let validation_error = api_validate(scheme, req, res)
  if (validation_error) {
    res.status(422)
    return res.send({ errors: valid_err })
  }

  let { email, firstName, lastName, role, new_password, old_password } =
    req.body
  let updatedUserData = {}
  try {
    user = await DB("users").find(user_id)
    if (!user) {
      res.status(422)
      return res.send({
        errors: "User with this id " + user_id + " couldn't found.",
      })
    }
    if (email) {
      const uniqueErr = await unique("Users", "email", email)
      if (uniqueErr) {
        res.status(422)
        return res.send({ errors: { email: uniqueErr } })
      }
      updatedUserData.email = email
    }
    if (firstName) {
      updatedUserData.firstName = firstName
    }
    if (lastName) {
      updatedUserData.lastName = lastName
    }
    if (role) {
      updatedUserData.role = role
    }
    if (new_password) {
      if (!old_password) {
        res.status(422)
        return res.send({
          errors: "The old password with new password is required.",
        })
      }
      if (!bcrypt.compareSync(old_password, user.password)) {
        res.status(422)
        return res.send({ errors: "The old password is incorrect." })
      }
      updatedUserData.password = bcrypt.hashSync(new_password, 8)
    }
    let userPhoto = req.files ? req.files.photo : null
    if (userPhoto) {
      let imageName = uuidv4(Date.now()) + generateString(4)
      let ext = extFrom(userPhoto.mimetype, userPhoto.name)
      if (ext.toLowerCase() !== ".png" && ext.toLowerCase() !== ".jpg") {
        res.status(422)
        return res.send({ errors: "file not a jpg or png." })
      }

      let uploaded = saveFileContentToPublic(
        "images/uploads/users",
        imageName + ext,
        userPhoto.data
      )
      if (!uploaded) {
        res.status(422)
        return res.send({ errors: "Photo not uploaded." })
      }
      if (user.photo) {
        fs.unlinkSync(__basedir + "/public/" + user.photo)
      }
      updatedUserData.photo = "images/uploads/users/" + imageName + ext
    }

    if (Object.keys(updatedUserData).length > 0) {
      await DB("users").where("id", user_id).update(updatedUserData)
    } else {
      return res.send({ message: "Nothing to update." })
    }
  } catch (error) {
    console.error(error)
    res.status(422)
    return res.send({ errors: "User not updated." })
  }

  return res.send({ message: "User data updated successfully." })
}

const destroy = async (req, res, next) => {
  let { user_id } = req.params
  if (!user_id) {
    res.status(422)
    return res.send({ errors: "No user id parameter." })
  }
  if (user_id === res.locals.api_auth.admin.id.toString()) {
    res.status(422)
    return res.send({ errors: "You can not delete self." })
  }
  let user = null
  try {
    user = await DB("Users").find(user_id)
    if (!user) {
      res.status(422)
      return res.send({
        errors: "User with this id " + user_id + " can not found.",
      })
    }
    await DB("Users").where("id", user_id).delete()
    let photo = user.photo
    if (photo) {
      fs.unlinkSync(__basedir + "/public/" + photo)
    }
  } catch (error) {
    console.error(error)
    res.status(422)
    return res.send({ errors: "User not deleted." })
  }
  console.log(req.params)
  return res.send({
    message: "User with this id " + user_id + " deleted successfully.",
  })
}

module.exports = {
  logged,
  login,
  logOut,
  register,
  createEmployee,
  update,
  destroy,
}
