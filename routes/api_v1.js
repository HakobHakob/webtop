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

/* GET home page. */
router.get("/", async (req, res, next) => {
  res.send("respond with a resource", { title: "Home" })
})

/* Login page */
router.post("/login", async (req, res, next) => {
  req.session.errors = req.session.errors || {}

  const validation_error = api_validate(req, res)
  if (validation_error) {
    return res.redirectBack()
  }

  const { email, password } = req.body
  const user = await User.findOne({ where: { email: email } })

  if (!user) {
    req.session.errors["email"] = "Invalid email !!!"

    return res.redirectBack()
  }

  //  cheking that is valid email or password
  const isValid = await bcrypt.compare(password, user.dataValues.password)

  if (!isValid) {
    req.session.errors["password"] = "Invalid password !!!"
    return res.redirectBack()
  }

  const token = await saveAndGetUserToken(user.dataValues.id, "admin")

  return res.send({ user, token })
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
