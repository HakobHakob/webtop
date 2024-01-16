const express = require("express")
const router = express.Router()
const { User } = require("../models")

/* GET home page. */
router.get("/", async (req, res, next) => {
  res.render("layouts/main/home", {
    title: "Express",
  })
})

/*Go to register page*/
router.get("/register", async (req, res, next) => {
  res.render("layouts/main/register", { title: "Register" })
})

router.post("/register", async (req, res, next) => {
  try {
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
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    next(error)
  }
})

module.exports = router
