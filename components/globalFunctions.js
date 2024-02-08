const fs = require("fs")
const { translations } = require("./translations")
const { conf } = require("../config/app_config")
const { makeDirectoryIfNotExists } = require("./functions")

const saveFileContentToPublic = (path, fileName, fileData) => {
  try {
    let fullPath = __basedir + "/public/images/" + path
    makeDirectoryIfNotExists(fullPath)
    fs.writeFileSync(fullPath + "/" + fileName, fileData)
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

const translate = (word, language) => {
  let languageDefault = conf.lang.default ?? null
  let lang = language ?? conf.lang.default ?? null
  try {
    if (
      word &&
      typeof word === "string" &&
      lang &&
      typeof lang === "string" &&
      word in translations
    ) {
      if (lang in translations[word]) {
        return translations[word][lang]
      } else if (
        languageDefault &&
        typeof languageDefault === "string" &&
        languageDefault in translations[word]
      ) {
        return translations[word][languageDefault]
      }
    }
    if (word && typeof word === "object" && lang && typeof lang === "string") {
      if (lang in word) {
        return word[lang]
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

module.exports = { saveFileContentToPublic, translate }
