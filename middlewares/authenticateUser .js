const bcrypt = require("bcrypt")
const { User } = require("../models")

const authenticateUser = async (req, res, next) => {
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
    errors["email"] = "The user with this email does not exist."
    res.status(403)
    return res.send({ errors })
  }

  // Attach the user object to the request for later use in the route handlers
  req.user = user

  next()
}

module.exports = { authenticateUser }
