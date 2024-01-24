const fs = require("fs")

const uploadFilesToDB = async (path, fileName, fileData) => {
  try {
    let fullPath = __basedir + path

    await makeDirectoryIfNotExists(fullPath)
    fs.writeFileSync(fullPath + fileName, fileData)
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

const makeDirectoryIfNotExists = async (path) => {
  let pathArr = path.split(/[/\\]/gi)
  try {
    let addPath = ""
    pathArr.forEach((pathItem) => {
      addPath += pathItem + "/"
      if (!fs.existsSync(addPath) || !fs.statSync(addPath).isDirectory()) {
        fs.mkdirSync(addPath)
        console.log("Folder created...")
      }
    })
  } catch (error) {
    console.error(error)
  }
}

module.exports = { uploadFilesToDB, makeDirectoryIfNotExists }
