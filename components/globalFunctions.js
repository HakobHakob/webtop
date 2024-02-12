const fs = require("fs")
const { translations } = require("./translations")
const { conf } = require("../config/app_config")
const { makeDirectoryIfNotExists, generateString } = require("./functions")
const extFrom = require("./mimeToExt")
const md5 = require("md5")

const saveFileContentToPublic = async (path, fileName, fileData) => {
  try {
    let fullPath = __basedir + "/public/" + path
    await makeDirectoryIfNotExists(fullPath)
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

// Function to handle image upload
const handleImageUpload = async (image, index, path) => {
  let imageName = md5(Date.now() + index.toString()) + generateString(4)
  let ext = extFrom(image.mimetype, image.name)
  if (ext.toLowerCase() !== ".png" && ext.toLowerCase() !== ".jpg") {
    throw new Error("file not a jpg or png.")
  }
  let uploaded = saveFileContentToPublic(path, imageName + ext, image.data)
  if (!uploaded) {
    throw new Error("file not uploaded.")
  }
  return imageName + ext
}

module.exports = { handleImageUpload, saveFileContentToPublic, translate }
