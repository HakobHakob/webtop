const {
  api_validate,
  registrationSchema,
  loginScheme,
  unique,
} = require("../../../components/validate")
const { User } = require("../../../models")
const bcrypt = require("bcrypt")
const {
  saveAndGetUserToken,
  apiLogoutUser,
  generateString,
} = require("../../../components/functions")
const { userNotification } = require("../../notifications/userNotification")
const userResource = require("../../resources/userResource")
const { apiErrors } = require("../../../components/util")

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
  const user = await User.findOne({ where: { email: email } })
  if (user) {
    if (!bcrypt.compareSync(password, user.dataValues.password)) {
      res.status(422)
      return res.send({ errors: req.session.errors["password"] })
    }
  } else {
    res.status(422)
    return res.send({ errors: req.session.errors["email"] })
  }
  const token = await saveAndGetUserToken(user.dataValues.id, "admin")

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
  if (res.locals.api_auth.user) {
    logout = await apiLogoutUser(
      res.locals.api_auth.user.dataValues.id,
      "user",
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
  const uniqueErr = await unique("Users", "email", req.body.email)
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

module.exports = { login, logOut, register }
