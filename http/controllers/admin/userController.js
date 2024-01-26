const Joi = require("joi")
const { api_validate } = require("../../../components/validate")
const { User } = require("../../../models")
const bcrypt = require("bcrypt")
const {
  saveAndGetUserToken,
  apiLogoutUser,
  generateString,
} = require("../../../components/functions")
const { userNotification } = require("../../notifications/userNotification")

class UserController {
  async login(req, res, next) {
    let valid_err = api_validate(
      {
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(30).required(),
      },
      req,
      res
    )
    if (valid_err) {
      res.status(422)
      return res.send({ errors: valid_err })
    }

    const { email, password } = req.body
    const errors = {}
    const user = await User.findOne({ where: { email: email } })
    if (user) {
      if (!bcrypt.compareSync(password, user.dataValues.password)) {
        errors["password"] = "The password is incorrect."
        res.status(422)
        return res.send({ errors: errors })
      }
    } else {
      errors["email"] = "The user with this email does not exists."
      res.status(422)
      return res.send({ errors: errors })
    }
    const token = await saveAndGetUserToken(user.dataValues.id, "admin")

    return res.send({ user: user, token: token })
  }

  async logout(req, res, next) {
    let logout = false
    if (res.locals.$api_auth.admin) {
      logout = await apiLogoutUser(
        res.locals.$api_auth.admin.dataValues.id,
        "admin",
        req,
        res
      )
    }
    if (logout) {
      return res.send({ message: "Logged out successfully." })
    }
    res.status(422)
    return res.send({ errors: "Not logged out." })
  }

  async create(req, res, next) {
    let valid_err = api_validate(
      {
        email: Joi.string().email().required(),
        first_name: Joi.string().min(2).max(30).required(),
        last_name: Joi.string().min(2).max(30).required(),
        role: Joi.string().min(2).max(30),
        password: Joi.string().min(6).max(30),
      },
      req,
      res
    )
    if (valid_err) {
      res.status(422)
      return res.send({ errors: valid_err })
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
    let newUser = await User.create({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      email_verified_at: new Date(),
      role: req.body.role,
      password: req.body.password,
    })
    let send = await userNotification(
      req.body.email,
      "User created",
      '<div style="font-size: 35px;color: #077">Hello, You are registered in WebTop, your password: ' +
        req.body.password +
        "</div>",
      "html"
    )
    return res.send({ user: newUser, message: message, generatedPassword })
  }
}

module.exports = { UserController }
