const express = require("express")
const router = express.Router()
const url = require("url")

const { User, Products } = require("../models")
const { DB } = require("../components/db.js")
const { Op } = require("sequelize")
const { validate } = require("../components/validate.js")
const { loginUser, logoutUser } = require("../components/functions")
const bcrypt = require("bcrypt")
const genAuthToken = require("../JoiValidator/authToken/genAuthToken")

// const {
//   validationResult,
//   validator,
//   checkSchema,
// } = require("express-validator")
const { validateSignup } = require("../JoiValidator/loginValidator")
const verifyToken = require("../middlewares/verifyToken.js")

const social = [
  { name: "YouTube", link: "http://www.youtube.com" },
  { name: "Spotify", link: "https://open.spotify.com/" },
]

/* GET home page. */
router.get("/", async (req, res, next) => {
  // app.param('id', /^\d+$/);
  // app.get('/user/:id', function(req, res){
  //     res.send('user ' + req.params.id);
  // });
  res.locals.fullUrl = {
    protocol: req.protocol,
    host: req.get("host"),
    path: req.path,
    query: req.query,
  }

  try {
    const users = await User.findAll({
      limit: 1,
    })
    const products = await Products.findAll({
      limit: 2,
      // where: { brand_id: { [Op.not]: null } },
      // order: [["id", "ASC"]],
    })
    // let products = DB('SELECT * FROM `products` LIMIT 3');
    // console.log(products);

    res.render("layouts/main/home", {
      title: "Express",
      social,
      users,
      products,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    next(error)
  }
})

/*Get about page*/
router.get("/about", (req, res, next) => {
  res.render("layouts/main/about", { title: "About" })
})

/*Get contacts page*/
router.get("/contacts", (req, res, next) => {
  res.render("layouts/main/contacts", { title: "Contacts" })
})

/*Go to login page*/
router.get("/login", async (req, res, next) => {
  // console.log(moment().format('yyyy_MM_DD_HH:mm:ss'));
  // console.log(req.session);
  // +++++++++++++++++++++++++++++++++++++++++++++++++++++
  // generateToken(1);
  if (res.locals.auth.user) {
    return res.redirect("/")
  }
  // +++++++++++++++++++++++++++++++++++++++++++

  // Check if there is a token but it is crushed
  const refererPath = url.parse(req.header("Referer")).pathname
  if (req.cookies.access_token && refererPath === "/error") {
    // res.clearCookie("access_token")
    return res.redirect("/login")
  }

  res.render("layouts/main/login", { title: "Login" })
})

// express validator
// "user" => req.query { user: '' }
// router.post("/login", async (req, res, next) => {
//   await checkSchema({
//     email: { isEmail: true },
//     password: { isLength: { options: { min: 3, max: 6 } } },
//   }).run(req)

//   const errors = validationResult(req)

//   if (!errors.isEmpty()) {
//     req.session.errors = {}

//     errors.array().forEach((item) => {
//       req.session.errors[item.path] = item
//     })
//     let backURL = req.header("Referer") || "/"
//     return res.redirect(backURL)
//   }

//   res.redirect("/")
// })

//Joi validator
router.post("/login", async (req, res, next) => {
  // ************************
  // if (res.locals.auth.user) {
  //   return res.redirect("/")
  // }
  // **************************
  res.setHeader("Access-Control-Expose-Headers", "*")

  const { error, value } = validateSignup(req.body)
  let backURL
  req.session.errors = {}

  if (error) {
    console.log(`Login error: ${error}`)

    error.details.forEach((err) => {
      req.session.errors[err.path[0]] = err.message
    })

    backURL = req.header("Referer")
    return res.redirect(backURL)
  }

  // check the user exist
  const user = await User.findOne({ where: { email: req.body.email } })

  if (!user) {
    req.session.errors["email"] = "Invalid email !!!"

    backURL = req.header("Referer") || "/login" || "/register"
    return res.redirect(backURL)
  }

  //  cheking that is valid email or password
  const isValid = await bcrypt.compare(
    req.body.password,
    user.dataValues.password
  )

  if (!isValid) {
    req.session.errors["password"] = "Invalid password !!!"

    backURL = req.header("Referer") || "/login"
    return res.redirect(backURL)
  }

  // set token in cookie
  const { accessToken, refreshToken } = genAuthToken(user)

  // Use Cookies
  res
    .cookie("access_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .set("Authorization", `Bearer ${accessToken}`)

  /* Use Headers:
     res.header("Authorization", `Bearer ${token}`)
  */

  //  ************************************************  //
  // await loginUser(user.dataValues.id, req, res, "user")
  // await loginUser(user.dataValues.id, req, res, "admin")

  //  ***********************************************  //

  return res.redirect("/")
})

// Only authenticated users can access this route
router.get("/protected", verifyToken, (req, res, next) => {
  // return res.json({ user: { id: req.user.id, role: req.userRole } })

  res.render("layouts/main/protected-route", {
    title: "Protected",
    user: req.user,
  })
})

// Logout router
router.get("/logout", verifyToken, async (req, res) => {
  // *************************************************** //
  // if (res.locals.auth.user) {
  //   await logoutUser(res.locals.$auth.user.dataValues.id, "user", req, res)
  // }
  // if (res.locals.auth.admin) {
  //   await logoutUser(res.locals.$auth.admin.dataValues.id, "admin", req, res)
  // }
  // res.redirectBack()

  //  ************************************************** //
  res.clearCookie("access_token")
  const refererPath = url.parse(req.header("Referer")).pathname
  let backURL

  // Check if there is a token but it is crushed
  if (req.cookies.access_token && refererPath === "/error") {
    res.clearCookie("access_token")
    backURL = refererPath || "/"
    return res.redirect(backURL)
  }

  if (refererPath === "/protected") {
    backURL = "/"
  } else {
    backURL = refererPath || "/"
  }

  return res.redirect(backURL)
})

/*Go to register page*/
router.get("/register", async (req, res, next) => {
  res.render("layouts/main/register", { title: "Register" })
})

router.post("/register", async (req, res, next) => {
  try {
    const users = await User.findAll({
      limit: 5,
    })
    const products = await Products.findAll({
      limit: 2,
    })

    const { username, userlastname, email, password } = req.body

    User.create({
      firstName: username,
      lastName: userlastname,
      email: email,
      password: password,
    })
    // Go to page , that you want. For example home
    res.render("layouts/main/home", {
      title: "Express",
      social,
      users,
      products,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    next(error)
  }
})

module.exports = router
