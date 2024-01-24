const moment = require("moment")
const { getUserByToken } = require("../components/functions")
const { conf } = require("../config/app_config")

const authMiddleware = async (req, res, next) => {
  res.locals.auth = {}

  for (let key in req.cookies) {
    if (key.startsWith(conf.cookie.prefix + conf.cookie.delimiter)) {
      let [role, userId, auth] = await getUserByToken(
        req.cookies[key],
        req,
        res,
        true
      )
      if (userId && role && auth) {
        res.locals.auth[role] = auth
      } else {
        res.cookie(key, "", { maxAge: -1 })
      }
    }
  }
  //----------old values-----------------------------------
  res.locals.old = req.session.old || {}
  req.session.old = req.body || {}
  //----------previous url---------------------------------
  res.locals.prevUrl = req.session.prevUrl || ""
  req.session.prevUrl = req.url || ""
  //----------errors---------------------------------------
  res.locals.errors = req.session.errors || null
  req.session.errors = {}

  delete req.session.errors

  res.locals.fullUrl = {
    protocol: req.protocol,
    host: req.get("host"),
    path: req.path,
    query: req.query,
    url: req.url,
  }

  let backURL = req.header("Referer") || req.url || "/"
  res.redirectBack = () => {
    return res.redirect(backURL)
  }

  res.locals.access_token = req.cookies.access_token || null

  next()
}

module.exports = authMiddleware
