const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const moment = require("moment/moment")
const { DB } = require("../components/db")
const {
  loginUser,
  logoutUser,
  makeDirectoryIfNotExists,
} = require("../components/functions")
const { api_validate, unique } = require("../components/validate")
const { apiErrors } = require("../components/util")
const { userNotification } = require("../http/notifications/userNotification")

//import controllers media
const sharp = require("sharp")
const mediaController = require("../http/controllers/mediaController/mediaController")
const multer = require("multer")
const upload = multer()

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
  if (res.locals.auth.user) {
    return res.redirect("/")
  }
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
    return res.redirectBack()
  }

  const { email, password } = req.body
  const user = await DB("users").where("email", email).first()

  if (!user) {
    req.session.errors["email"] = "Invalid email !!!"
    res.status(422)
    return res.redirectBack()
  }

  //  cheking that is valid email or password
  const isValid = await bcrypt.compare(password, user.dataValues.password)
  if (!isValid) {
    req.session.errors["password"] = "Invalid password !!!"
    res.status(422)
    return res.redirectBack()
  }
  const { id } = user.dataValues
  await loginUser(id, res, "user")
  await loginUser(id, res, "admin")

  res.status(200)
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
  req.session.errors = req.session.errors || {}
  const uniqueErr = await unique("users", "email", req.body.email)
  if (uniqueErr) {
    res.status(422)
    return res.send({ errors: { email: uniqueErr } })
  }
  const validation_error = api_validate("userRegistration", req, res)

  if (validation_error) {
    for (const errKey in errors) {
      for (const valid_err_key in validation_error) {
        if (errKey === valid_err_key) {
          req.session.errors[errKey] = errors[errKey]
        }
      }
    }

    res.status(422)
    return res.redirectBack()
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
    return res.redirectBack()
  }

  await userNotification(
    email,
    "User created",
    '<div style="font-size: 35px;color: #077">Hello, You are registered in WebTop, your password: ' +
      password +
      "</div>",
    "html"
  )

  // Go to page , that you want. For example home
  res.redirectBack()
})

router.get("/logout", async (req, res, next) => {
  if (res.locals.auth.user) {
    await logoutUser(res.locals.auth.user.id, "user", req, res)
  }
  if (res.locals.auth.admin) {
    await logoutUser(res.locals.auth.admin.id, "admin", req, res)
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

/*GET portfolio page*/
router.get("/portfolio", async (req, res, next) => {
  res.render("layouts/main/portfolio", { title: "Portfolio" })
})

router.post("/portfolio", async (req, res) => {
  try {
    const file = req.file
    if (file === undefined) {
      return res.send("You must select a file.")
    }
    const tmpAvatarPath =
      __basedir + "/public/images/uploads/" + `${file.fieldname}`
    const uuidMatch = file.filename.match(/^([a-f\d]+(?:-[a-f\d]+)*)/i)
    let uuid = uuidMatch ? uuidMatch[1] : undefined
    await makeDirectoryIfNotExists(tmpAvatarPath)
  } catch (error) {
    console.log(error)
    return res.send(`Error when trying upload images: ${error}`)
  }
})
module.exports = router
