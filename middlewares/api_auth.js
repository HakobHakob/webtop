const { getApiAuth } = require("../components/functions")
const { conf } = require("../config/app_config")

const api_auth = async (req, res, next) => {
  res.locals.api_auth = {}
  res.locals.api_new_token = null

  const authData = await getApiAuth(req, res)
  if (authData) {
    res.locals.api_auth[authData.role] = authData.auth
    res.locals.api_new_token = authData.newToken
  }
  const allLangKeys = Object.keys(conf.lang.all ?? [])
  res.locals.api_local = allLangKeys.includes(req.headers["accept-language"])
    ? req.headers["accept-language"]
    : conf.lang.default ?? null
  next()
}
module.exports = api_auth
