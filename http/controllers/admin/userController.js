const { User } = require("../../../models")
const bcrypt = require("bcrypt")
const { DB } = require("../../../components/db")
const moment = require("moment/moment")
const fs = require("node:fs")
const { v4: uuidv4 } = require("uuid")
const {
  api_validate,
  registrationSchema,
  loginScheme,
  unique,
  userUpdateScheme,
} = require("../../../components/validate")
const {
  saveAndGetUserToken,
  apiLogoutUser,
  generateString,
} = require("../../../components/functions")
const { userNotification } = require("../../notifications/userNotification")
const { apiErrors } = require("../../../components/util")
const userResource = require("../../resources/usersResourse")
const {
  handleImageUpload,
  deleteAllFilesInDir,
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
    logout = await apiLogoutUser(
      res.locals.api_auth.admin.id,
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

  let userImg = req.files ? req.files.photo : null
  let image = null
  if (userImg) {
    try {
      const userImgPath = "storage/uploads/users/"
      image = await handleImageUpload(userImg, 0, userImgPath)
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

const createEmployee = async (req, res, next) => {
  const uniqueErr = await unique("employees", "email", req.body.email)
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
    message = "Employee password generated automatically, it send to email."
  }

  // Handle employee avatar upload
  let employeeAvatar = req.files ? req.files.image : null
  let avatar = null
  if (employeeAvatar) {
    try {
      const employeeAvatarPath = "storage/uploads/employeeAvatar/"
      avatar = await handleImageUpload(employeeAvatar, 0, employeeAvatarPath)
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
    try {
      const userPhotoPath = "storage/uploads/employeesImages/"
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

  const { firstName, lastName, rank, title, description, email, password } =
    req.body

  let newEmployeeData = {
    firstName,
    lastName,
    image: avatar,
    images: imagesJson,
    rank: rank,
    title,
    description,
    email,
    password: bcrypt.hashSync(password, 8),
    emailVerifyedAt: moment().format("yyyy-MM-DD HH:mm:ss"),
    createdAt: moment().format("yyyy-MM-DD HH:mm:ss"),
    updatedAt: moment().format("yyyy-MM-DD HH:mm:ss"),
  }

  try {
    await DB("employees").create(newEmployeeData)
  } catch (e) {
    console.error(e)
    res.status(422)
    return res.send({ errors: "User not created." })
  }
  // await userNotification(
  //   email,
  //   "Employee created",
  //   '<div style="font-size: 35px;color: #077">Hello, You are registered in WebTop, your password: ' +
  //     password +
  //     "</div>",
  //   "html"
  // )
  return res.send({ user: newEmployeeData, message, generatedPassword })
}

const updateEmployee = async (req, res, next) => {
  req.session.errors = req.session.errors || {}
  const { employee_id } = req.params
  let employee = null

  if (!employee_id) {
    res.status(422)
    return res.send({ errors: "There isn't employee id parameter." })
  }
  const scheme = userUpdateScheme()
  let validation_error = api_validate(scheme, req, res)
  if (validation_error) {
    res.status(422)
    return res.send({ errors: valid_err })
  }

  const { email, firstName, lastName, rank, new_password, old_password } =
    req.body

  let updateEmployeeData = {}
  try {
    employee = await DB("employees").find(employee_id)
    if (!employee) {
      res.status(422)
      return res.send({
        errors: "Employee with this id " + employee_id + " couldn't found.",
      })
    }
    if (email) {
      const uniqueErr = await unique("employees", "email", email)
      if (uniqueErr) {
        res.status(422)
        return res.send({ errors: { email: uniqueErr } })
      }
      updateEmployeeData.email = email
    }
    if (firstName) {
      updateEmployeeData.firstName = firstName
    }
    if (lastName) {
      updateEmployeeData.lastName = lastName
    }
    if (rank) {
      updateEmployeeData.rank = rank
    }
    if (new_password) {
      if (!old_password) {
        res.status(422)
        return res.send({
          errors: "The old password with new password is required.",
        })
      }
      if (!bcrypt.compareSync(old_password, employee.password)) {
        res.status(422)
        return res.send({ errors: "The old password is incorrect." })
      }
      updateEmployeeData.password = bcrypt.hashSync(new_password, 8)
    }

    const employeeAvatar = req.files ? req.files.photo : null
    if (employeeAvatar) {
      const avatarPath = "storage/uploads/employeeAvatar/"

      // Remove the previous image if it exists
      try {
        if (employee.image) {
          await deleteAllFilesInDir(__basedir + "/public/" + avatarPath)
        }
        updateEmployeeData.image = await handleImageUpload(
          employeeAvatar,
          employee_id,
          avatarPath
        )
      } catch (error) {
        res.status(422)
        return res.send({ errors: error.message })
      }
    }

    if (Object.keys(updateEmployeeData).length > 0) {
      await DB("employees").where("id", employee_id).update(updateEmployeeData)
    } else {
      return res.send({ message: "Nothing to update." })
    }
  } catch (error) {
    console.error(error)
    res.status(422)
    return res.send({ errors: "User not updated." })
  }

  for (const key in updateEmployeeData) {
    employee[key] = updateEmployeeData[key]
  }

  return res.send({
    employee,
    message: "User data updated successfully.",
  })
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
  register,
  createEmployee,
  updateEmployee,
  destroy,
}
