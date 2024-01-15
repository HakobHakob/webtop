let SEKRET_KEY = ""

const secretKey =  () => {
  SEKRET_KEY = require("crypto").randomBytes(64).toString("hex")

  return SEKRET_KEY
}

module.exports = {
  SEKRET_KEY,
  secretKey,
}
