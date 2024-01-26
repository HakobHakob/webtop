const { getApiAuth } = require("../components/functions")
const { conf } = require("../config/app_config")

const api_auth = async (req, res, next) => {
  const BEARER_PREFIX = "Bearer "
  res.locals.api_auth = {}
  res.locals.api_new_token = null
  let authData = await getApiAuth(req, res)

  if (authData) {
    res.locals.api_auth[authData.role] = authData.auth
    res.locals.api_new_token = authData.newToken
  }
  res.locals.api_local =
    req.headers["accept-language"] ?? conf.lang.default ?? null
  next()
}
module.exports = api_auth
