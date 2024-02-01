const express = require("express")
const router = express.Router()
const { apiLogoutUser } = require("../components/functions")
const { userNotification } = require("../http/notifications/userNotification")
const {
  login,
  logOut,
  register,
} = require("../http/controllers/admin/userController")

/* GET home page. */
router.get("/", async (req, res, next) => {
  res.send("respond with a resource", { title: "Home" })
})

/*GET login page*/
router.get("/login", async (req, res, next) => {
  res.render("layouts/main/login", { title: "Login" })
})

router.post("/login", login)

// Do logout
router.get("/logout", logOut)

router.get("/register", async (req, res, next) => {
  res.render("layouts/main/register", { title: "Register" })
})

// Create user
router.post("/register", register)

// Post request to send an email
router.post("/sendmail", async (req, res) => {
  const result = await userNotification(
    req.body.email,
    "subject",
    "message",
    "text"
  )
  try {
    // send the response
    res.json({
      status: true,
      payload: result,
    })
  } catch (error) {
    console.error(error.message)
    res.json({
      status: false,
      payload: "Something went wrong in Sendmail Route.",
    })
  }
})

module.exports = router
