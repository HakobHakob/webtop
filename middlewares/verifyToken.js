const secretkey = require("crypto").randomBytes(64).toString("hex") //we can use this secretkey
const jwt = require("jsonwebtoken")

const secretKey = process.env.JWT_SECRET_KEY

const verifyToken = (req, res, next) => {
  console.log("AuthToken>>>>>>", req.headers["Authorization"])

  // req.header("x-auth-token")

  let token

  if (!req.headers.authorization) {
    // Use Cookies
    token = req.cookies.access_token
  } else {
    // Use Headers:
    token = req.headers.authorization
  }

  if (!token) {
    return res.redirect("/login")
  }

  try {
    const decodedUser = jwt.verify(token, secretKey)

    req.user = decodedUser
    next()
  } catch (error) {
    res.clearCookie("access_token")
    return res.redirect("/error")
  }
}

module.exports = verifyToken
