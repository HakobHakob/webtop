const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const { User } = require("../models")
const { loginUser, logoutUser } = require("../components/functions")
const { validate } = require("../components/validate")
//import controllers media
const sharp = require("sharp")
const mediaController = require("../http/controllers/mediaController/mediaController")

/* GET home page. */
router.get("/", async (req, res, next) => {
  res.render("layouts/main/home", {
    title: "Express",
  })
})

/*GET login page*/
router.get("/login", async (req, res, next) => {
  if (res.locals.auth.user) {
    return res.redirect("/")
  }
  res.render("layouts/main/login", { title: "Login" })
})

/* POST login page */
router.post("/login", async (req, res, next) => {
  req.session.errors = req.session.errors || {}

  if (res.locals.auth.user) {
    return res.redirect("/")
  }

  const validation_error = validate(req, res)
  if (!validation_error) {
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

  const { id } = user.dataValues
  await loginUser(id, req, res, "user")
  await loginUser(id, req, res, "admin")

  res.redirect("/")
})

/*GET login page*/
router.get("/about", async (req, res, next) => {
  res.render("layouts/main/about", { title: "Login" })
})

/*GET register page*/
router.get("/register", async (req, res, next) => {
  res.render("layouts/main/register", { title: "Register" })
})

/* POST register page */
router.post("/register", async (req, res, next) => {
  try {
    const { username, userlastname, email, password } = req.body

    User.create({
      firstName: username,
      lastName: userlastname,
      email: email,
      password: password,
      role: "admin",
      emailVerifyedAt: new Date(),
    })

    // Go to page , that you want. For example home
    res.render("layouts/main/home", {
      title: "Express",
    })
  } catch (err) {
    console.error("Error fetching users:", err)
    next(err)
  }
})

router.get("/logout", async (req, res, next) => {
  if (res.locals.auth.user) {
    await logoutUser(res.locals.auth.user.dataValues.id, "user", req, res)
  }
  if (res.locals.auth.admin) {
    await logoutUser(res.locals.auth.admin.dataValues.id, "admin", req, res)
  }
  res.redirectBack()
})

router.get("/profile", async (req, res, next) => {
  res.render("layouts/main/profile", {
    title: "Profile",
  })
})

// router.post("/profile", mediaController.upload, async (req, res) => {
//  try {
//   const file = req.file
//  } catch (error) {

//  }

// })
module.exports = router
