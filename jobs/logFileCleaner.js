const cron = require("node-cron")
const { conf } = require("../config/app_config")
const fs = require("node:fs")
const moment = require("moment/moment")

//(second (optional) | minute | hour | day of month | month  day of week)
cron.schedule("0 0 * * *", async () => {
  //running every day at 0:00
  let lastDate = new Date(new Date() - 60 * 24 * 3600 * 1000) //last 60 days
  try {
    let logFiles = fs.readdirSync(__basedir + "/" + conf.log.path)
    logFiles.forEach((logFile) => {
      let logFilePath = __basedir + "/" + conf.log.path + "/" + logFile
      if (fs.statSync(logFilePath).isFile()) {
        let fileName = logFile.endsWith(conf.log.ext)
          ? logFile.slice(0, logFile.length - conf.log.ext.length)
          : ""
        if (fileName) {
          let m = moment(fileName, "yyyy_MM_DD")
          if (m < lastDate) {
            fs.unlinkSync(logFilePath)
          }
        }
      }
    })
  } catch (e) {
    console.error(e)
  }
})
