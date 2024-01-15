const express = require("express")
const router = express.Router()

/* GET users listing. */
router.get("/",  (req, res, next) => {
  res.send("respond with a resource")
})


router.post("/login",  (req, res, next) => {
// get email and password, validator, error, JWT and session, 
// accec_
})

module.exports = router
