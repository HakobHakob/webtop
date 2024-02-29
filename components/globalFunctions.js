const fs = require("fs")
const path = require("path")

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

const translate = (word, localParams) => {
  let languageDefault = conf.lang.default ?? null
  let lang = localParams ?? conf.lang.default ?? null
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
      } else {
        return ""
      }
    }
    return word
  } catch (e) {
    return word
  }
}

// Function to handle File upload
const handleFileUpload = async (file, path) => {
  let fileName = md5(Date.now()) + generateString(4)
  let ext = extFrom(file.mimetype, file.name)

  // Check if the file is an image based on the MIME type
  if (file.mimetype.startsWith("image")) {
    if (ext.toLowerCase() !== ".png" && ext.toLowerCase() !== ".jpg" && ext.toLowerCase() !== ".jpeg") {
      throw new Error("File not a jpg or png.")
    }
  }
  const uploaded = await saveFileContentToPublic(
    path,
    fileName + ext,
    file.data
  )

  if (!uploaded) {
    throw new Error("File not uploaded.")
  }
  return path + fileName + ext
}

const deleteAllFilesInDir = async (dirPath) => {
  fs.readdirSync(dirPath).forEach((file) => {
    fs.rmSync(path.join(dirPath, file))
  })
}

module.exports = {
  handleFileUpload,
  saveFileContentToPublic,
  deleteAllFilesInDir,
  translate,
}
