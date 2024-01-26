const fs = require("fs")
const { translations } = require("./translations")

const makeDirectory = async (path) => {
  let pathArr = path.split(/[/\\]/gi)
  try {
    let addPath = ""
    pathArr.forEach((pathItem) => {
      addPath += pathItem + "/"
      if (!fs.existsSync(addPath) || !fs.statSync(addPath).isDirectory()) {
        fs.mkdirSync(addPath)
      }
    })
  } catch (error) {
    console.error(error)
  }
}

global.translate = (word, language) => {
  return word in translations && language in translations[word]
    ? translations[word][language]
    : word
}

module.exports = { makeDirectory, translate: global.translate }
