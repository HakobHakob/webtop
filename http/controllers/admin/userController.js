const bcrypt = require("bcrypt")
const { DB } = require("../../../components/db")
const moment = require("moment/moment")
const fs = require("node:fs")
const { api_validate, unique } = require("../../../components/validate")
const {
  saveAndGetUserToken,
  apiLogoutUser,
  generateString,
} = require("../../../components/functions")
const { userNotification } = require("../../notifications/userNotification")
const { apiErrors } = require("../../../components/util")
const userResource = require("../../resources/usersResourse")
const { handleFileUpload } = require("../../../components/globalFunctions")

/* verify, is admin logged in  @returns true|false */
const logged = async (req, res, next) => {
  let loggedIn = !!res.locals.api_auth.admin
  return res.send({ logged: loggedIn })
}

const login = async (req, res, next) => {
  req.session.errors = req.session.errors || {}
  const validation_error = api_validate("login", req, res)
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
    user = await DB("users").where("email", email).first()
  } catch (e) {
    console.error(e)
  }

  if (user) {
    if (!bcrypt.compareSync(password, user.password)) {
      res.status(422)
      return res.send({ errors: req.session.errors["password"] })
    }
  } else {
    res.status(422)
    return res.send({ errors: req.session.errors["email"] })
  }
  const token = await saveAndGetUserToken(user.id, "admin")
  const userResourseData = await userResource(user)

  return res.send({ user: userResourseData, token })
}

const logOut = async (req, res, next) => {
  let logout = false
  if (res.locals.api_auth.admin) {
    logout = await apiLogoutUser(res.locals.api_auth.admin.id, "admin", req)
  }

  if (logout) {
    return res.send({ message: "Logged out successfully." })
  }
  // res.redirectBack()
  res.status(422)
  return res.send({ errors: "Not logged out." })
}

const createUser = async (req, res, next) => {
  const uniqueErr = await unique("users", "email", req.body.email)
  if (uniqueErr) {
    res.status(422)
    return res.send({ errors: { email: uniqueErr } })
  }
  req.session.errors = req.session.errors || {}
  const validation_error = api_validate("userRegistration", req, res)
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

  let userImg = req.files ? req.files.photo : null
  let image = null
  if (userImg) {
    try {
      const userImgPath = "storage/uploads/users/"
      image = await handleFileUpload(userImg, userImgPath)
    } catch (error) {
      res.status(422)
      return res.send({ errors: error.message })
    }
  }
  const { firstName, lastName, email, password, role } = req.body

  const newUserData = {
    first_name: firstName,
    last_name: lastName,
    email,
    email_verified_at: moment().format("yyyy-MM-DD HH:mm:ss"),
    role,
    photo: image,
    password: bcrypt.hashSync(password, 8),
    created_at: moment().format("yyyy-MM-DD HH:mm:ss"),
    updated_at: moment().format("yyyy-MM-DD HH:mm:ss"),
  }

  try {
    await DB("users").create(newUserData)
  } catch (e) {
    console.error(e)
    res.status(422)
    return res.send({ errors: "User not created." })
  }
  // await userNotification(
  //   email,
  //   "User created",
  //   "Hello, You are registered in WebTop, your password: " + password
  // )
  return res.send({ user: newUserData, message, generatedPassword })
}

const updateUser = async (req, res, next) => {
  const { user_id } = req.params
  let user = null
  const updateUserData = {}

  if (!user_id) {
    res.status(422)
    return res.send({ errors: "No user id parameter." })
  }
  const validation_error = api_validate("userUpdate", req, res)
  if (validation_error) {
    res.status(422)
    return res.send({ errors: valid_err })
  }

  const {
    email,
    firstName,
    lastName,
    role,
    new_password,
    old_password,
    photo,
  } = req.body

  try {
    user = await DB("users").find(user_id)

    if (!user) {
      res.status(422)
      return res.send({
        errors: `User with this id  ${user_id} can not found.`,
      })
    }

    if (email) {
      const uniqueErr = await unique("users", "email", email)
      if (uniqueErr) {
        res.status(422)
        return res.send({ errors: { email: uniqueErr } })
      }
      updateUserData.email = email
    }

    if (firstName) {
      updateUserData.first_name = firstName
    }
    if (lastName) {
      updateUserData.last_name = lastName
    }
    if (role) {
      updateUserData.role = role
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
      updateUserData.password = bcrypt.hashSync(new_password, 8)
    }
    if (user.photo) {
      fs.unlinkSync(__basedir + "/public/" + user.photo)
    }

    const userPhoto = req.files ? req.files.photo : null
    if (userPhoto) {
      const userPhotoPath = "storage/uploads/users/"
      updateUserData.photo = await handleFileUpload(userPhoto, userPhotoPath)
    }

    if (Object.keys(updateUserData).length > 0) {
      updateUserData.updated_at = moment().format("yyyy-MM-DD HH:mm:ss")
      await DB("users").where("id", user_id).update(updateUserData)
    } else {
      return res.send({ message: "Nothing to update." })
    }
  } catch (error) {
    console.error(error)
    res.status(422)
    return res.send({ errors: "User not updated." })
  }
  for (const key in updateUserData) {
    user[key] = updateUserData[key]
  }

  const locale = res.locals.api_local
  user = await userResource(user, locale)

  return res.send({
    data: { user },
    message: "User data updated successfully.",
    errors: {},
  })
}

const deleteUser = async (req, res, next) => {
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
    user = await DB("users").find(user_id)
    if (!user) {
      res.status(422)
      return res.send({
        errors: "User with this id " + user_id + " can not found.",
      })
    }

    const photo = user.photo
    if (photo) {
      fs.unlinkSync(__basedir + "/public/" + photo)
    }
    await DB("users").where("id", user_id).delete()
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
  createUser,
  updateUser,
  deleteUser,
}
