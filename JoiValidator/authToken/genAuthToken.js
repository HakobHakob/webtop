require("dotenv").config()
const jwt = require("jsonwebtoken")

const secretKey = process.env.JWT_SECRET_KEY



const genAuthToken = (user) => {
  const accessToken = jwt.sign(
    {
      id: user.id,
      name: user.firstName,
      email: user.email,
    },
    secretKey,
    { expiresIn: "10s" } //This means that the token will expire after one hour
  )

  const refreshToken = jwt.sign(
    {
      id: user.id,
      name: user.firstName,
      email: user.email,
    },
    secretKey,
    { expiresIn: "20s" } //This means that the token will expire after one day
  )

  return {accessToken,refreshToken}
}

module.exports = genAuthToken
