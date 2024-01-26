const winston = require("winston")
const moment = require("moment")
const cron = require("node-cron")
const { conf } = require("../config/app_config")

let log = null

const makeLog = () => {
  let now = moment().format("yyyy_MM_DD") // format => yyyy_MM_DD-HH:mm:ss'
  log = winston.createLogger({
    level: "info",
    format: winston.format.simple(),
    transports: [
      new winston.transports.File({filename: conf.log.path + '/' + now + conf.log.ext}) // вывод в файл
    ],
  })
}
makeLog()

cron.schedule("0 0 * * *", () => {
  //running every day at 0:00
  makeLog()
})

// Handle uncaught exceptions
const handleUncaughtException = (err) => {
  log.error(moment().format("yyyy_MM_DD-HH:mm:ss") + "\n" + err.stack + "\n\n")
  process.exit(1)
}

// Handle warnings
const handleWarning = (err) => {
  log.error(moment().format("yyyy_MM_DD-HH:mm:ss") + "\n" + err.stack + "\n\n")
}

// Handle stderr
const handleStderr = (mes, c) => {
  log.error(moment().format("yyyy_MM_DD-HH:mm:ss") + "\n" + mes + "\n\n")
  process.stdout.er(mes, c)
}

// Set up event listeners
const errProcessEvents = ["uncaughtException", "uncaughtExceptionMonitor"]
errProcessEvents.forEach((errProcessEvent) => {
  process.on(errProcessEvent, handleUncaughtException)
})

process.on("warning", handleWarning)

process.stdout.er = process.stderr.write
process.stderr.write = handleStderr

module.exports = log
