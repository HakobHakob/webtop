const express = require("express")
const router = express.Router()
const Joi = require("joi")
const bcrypt = require("bcrypt")
const { api_validate } = require("../components/validate")
const { User } = require("../models")
const {
  saveAndGetUserToken,
  apiLogoutUser,
} = require("../components/functions")
const userResource = require("../components/resources/user")

/* GET home page. */
router.get("/", async (req, res, next) => {
  res.send("respond with a resource", { title: "Home" })
})

/* Login page */
router.post("/login", async (req, res, next) => {
  const validation_error = api_validate(req, res)
  if (validation_error) {
    res.status(422)
    return res.send({ errors: validation_error })
  }

  const { email, password } = req.body
  const user = await User.findOne({ where: { email: email } })

  let errors = {}
  if (user) {
    if (!bcrypt.compareSync(password, user.dataValues.password)) {
      errors["password"] = "The password is incorrect."
      res.status(403)
      return res.send({ errors })
    }
  } else {
    errors["email"] = "The user with this email does not exists."
    res.status(403)
    return res.send({ errors })
  }

  const token = await saveAndGetUserToken(user.dataValues.id, "admin")

  return res.send({ user: userResource(user), token })
})

// Do logout
router.get("/logout", async (req, res, next) => {
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
  res.status(422)
  return res.send({ errors: "Not logged out." })
})

module.exports = router
