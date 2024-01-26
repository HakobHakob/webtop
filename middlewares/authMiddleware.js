const { getWebAuth } = require("../components/functions")
const { conf } = require("../config/app_config")
const { translations } = require("../globalFunctions/translations")

const authMiddleware = async (req, res, next) => {
  res.locals.auth = await getWebAuth(req, res)

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

  //----------local-----------------------------------------
  let languageDefault = conf.lang.default ?? null
  let language = (res.locals.local = conf.lang.default ?? null)
  res.locals.translate = (word) => {
    try {
      if (
        word &&
        typeof word === "string" &&
        language &&
        typeof language === "string" &&
        word in translations
      ) {
        if (language in translations[word]) {
          return translations[word][language]
        } else if (
          languageDefault &&
          typeof languageDefault === "string" &&
          languageDefault in translations[word]
        ) {
          return translations[word][languageDefault]
        }
      }
      if (
        word &&
        typeof word === "object" &&
        language &&
        typeof language === "string"
      ) {
        if (language in word) {
          return word[language]
        } else if (
          languageDefault &&
          typeof languageDefault === "string" &&
          languageDefault in word
        ) {
          return word[languageDefault]
        }
      }
      return word
    } catch (e) {
      return word
    }
  }
  //----------redirectBack----------------------------------

  let backURL = req.header("Referer") || req.url || "/"
  res.redirectBack = () => {
    return res.redirect(backURL)
  }

  res.locals.access_token = req.cookies.access_token || null

  next()
}

module.exports = authMiddleware
