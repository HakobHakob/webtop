const createError = require("http-errors")
const express = require("express")
const path = require("path")
const fs = require("node:fs")
const cookieParser = require("cookie-parser")
const logger = require("morgan")
// User registation
const session = require("express-session")
const moment = require("moment")
const cron = require("node-cron")


const bodyParser = require("body-parser")
const webRouter = require("./routes/web")
const usersRouter = require("./routes/api_v1")

const app = express()

//---------------------winston logger-start---------------------------------------------
const winston = require("winston")
// Создайте логгер с несколькими транспортами (куда записывать логи)
let log = null
const makeLog = () => {
  let now = moment().format("yyyy_MM_DD")
  log = winston.createLogger({
    level: "info", // уровень логирования
    format: winston.format.simple(), // формат вывода
    transports: [
      // new winston.transports.Console(), // вывод в консоль
      new winston.transports.File({ filename: "logs/" + now + ".log" }), // вывод в файл
    ],
  })
}
makeLog()
cron.schedule("0 0 * * *", () => {
  //running every day at 0:00
  makeLog()
  // console.log('cron running at ' + moment().format('yyyy_MM_DD-HH:mm:ss'));
})

// console.log(new Date(new Date() - conf.cookie.maxAge));
cron.schedule("*/5 * * * *", async () => {
  //running every 5 minutes
  // console.log('running session cleaner');
  await queryInterface.bulkDelete(
    conf.cookie.ses_table_name,
    {
      updated_at: {
        [Op.lt]: new Date(new Date() - conf.cookie.maxAge), //updated_at < now - maxAge
      },
    },
    {}
  )
  // console.log('cron running at ' + moment().format('yyyy_MM_DD-HH:mm:ss'));
})
// log.info('Это информационное сообщение.');
// log.warn('Это предупреждение.');
// log.error('Это сообщение об ошибке.');
// let processEvents = ['beforeExit', 'disconnect', 'exit', 'rejectionHandled', 'uncaughtException',
//   'uncaughtExceptionMonitor', 'unhandledRejection', 'warning', 'message'];
let errProcessEvents = ["uncaughtException", "uncaughtExceptionMonitor"]
errProcessEvents.forEach((errProcessEvent) => {
  process.on(errProcessEvent, (err) => {
    log.error(
      moment().format("yyyy_MM_DD-HH:mm:ss") + "\n" + err.stack + "\n\n"
    )
    process.exit(1)
  })
})
process.on("warning", (err) => {
  log.error(moment().format("yyyy_MM_DD-HH:mm:ss") + "\n" + err.stack + "\n\n")
})
// process.stdout.wr = process.stdout.write;
process.stdout.er = process.stderr.write
process.stderr.write = (mes, c) => {
  log.error(moment().format("yyyy_MM_DD-HH:mm:ss") + "\n" + mes + "\n\n")
  process.stdout.er(mes, c)
}

// process.on('exit', (code) => {
//   // console.log(`Процесс завершен с кодом: ${code}`);
//   log.error(moment().format('yyyy_MM_DD-HH:mm:ss') + '\nExit with code: ' + code + '\n\n');
//   // process.exit(1);
// });
//---------------------winston logger-end---------------------------------------------


// For set headers in res (res) object
const cors = require("cors")
app.use(cors())

// configure our .env file
const dotenv = require("dotenv")
const { getUserByToken } = require("./components/functions")
dotenv.config({ path: "./.env" })

// view engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

// Install ejs
app.use(require("express-ejs-layouts"))
app.set("layout", "layouts/includes/contentTemplate")

// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
// // setup the logger
// app.use(logger('combined', { stream: accessLogStream }));
// app.use(logger('dev'));

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))
// Set errors in session storage
app.use(
  session({
    name: "ses",
    secret: "Fb25ekS7Im", // Use a strong secret in production
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 10 * 60 * 1000 }, // Set the cookie expiration time
  })
)
//--------------------------------------------------------------------
global.usersTokens = {}
//----------------------------middleware------------------------------

// Get and set page url in res.locals
app.use(async (req, res, next) => {
  //res.on events: 'close', 'drain', 'error', 'finish', 'pipe', 'unpipe'
  // res.on('close', function(){
  //   console.log('res.locals=', res.locals.products);
  // });

  //----------auth user- ******START****------------------------------
  res.locals.auth = {}
  // console.log("global.usersTokens=", global.usersTokens)
  try {
    for (let key in req.cookies) {
      if (key.startsWith(conf.cookie.prefix + conf.cookie.delimiter)) {
        let role = req.cookies[key].split(conf.cookie.delimiter)[1]
        let auth = await getUserByToken(req.cookies[key])
        if (auth && role) {
          res.locals.$auth[role] = auth
          if (conf.cookie.re_save) {
            res.cookie(key, req.cookies[key], {
              maxAge: conf.cookie.maxAge,
              httpOnly: true,
            })
          }
        } else {
          res.cookie(key, "", { maxAge: -1 })
        }
      }
    }
  } catch (e) {
    log.error(moment().format("yyyy_MM_DD-HH:mm:ss") + "\n" + e.stack + "\n\n")
  }
  //----------auth user-end--------------------------------

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
    query: req.query, // for using this, do JSON.stringify()
    url: req.url,
  }

  let backURL = req.header("Referer") || req.url || "/"
  res.redirectBack = () => {
    return res.redirect(backURL)
  }

  //Get and set cookies token using JWT
  res.locals.access_token = req.cookies.access_token || null

  next()
})

// User registation
app.use(bodyParser.urlencoded({ extended: true }))

app.use("/", webRouter)
app.use("/users", usersRouter)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get("env") === "development" ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render("layouts/main/error", {
    title: "Error",
  })
})

module.exports = app
