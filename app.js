/**
 * // calling body-parser to handle the Request Object from POST requests
var bodyParser = require('body-parser');

// parse application/json, basically parse incoming Request Object as a JSON Object 
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded, basically can only parse incoming Request Object if strings or arrays
app.use(bodyParser.urlencoded({ extended: false }));

// combines the 2 above, then you can parse incoming Request Object if object, with nested objects, or generally any type.
app.use(bodyParser.urlencoded({ extended: true }));
 */

const express = require("express")
const app = express()
const path = require("path")
const cors = require("cors")
global.__basedir = __dirname
const cookieParser = require("cookie-parser")
// const log = require("./components/logger")
const session = require("express-session")
const bodyParser = require("body-parser") //To access the parameters passed with API request

/* configure our .env file
This is used to load the .env file, so that using process.env.{KEY} we can access the environment variables defined in the .env file. */
require("dotenv").config()

app.use(cors())
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
)
const webRouter = require("./routes/web")
const apiRouter = require("./routes/api_v1")

const {
  notFoundHandler,
  errorHandler,
} = require("./middlewares/errorMiddleware")
// log.info("This is an information message.")
require("./jobs/sessionCleaner")
require("./jobs/logFileCleaner")

// Install ejs
app.use(require("express-ejs-layouts"))
app.set("layout", "layouts/includes/contentTemplate")
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

const fileUpload = require("express-fileupload")
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    // useTempFiles : true,
    // tempFileDir : __dirname + '/tmp',
    // safeFileNames: true,
    // preserveExtension: true,
  })
)

app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))
app.use(
  session({
    name: "ses",
    secret: "Fb25ekS7Im", // Use a strong secret in production
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 10 * 60 * 1000 }, // Set the cookie expiration time
  })
)
app.use(require("./middlewares/authMiddleware"))
app.use(require("./middlewares/api_auth"))

app.use("/", webRouter)
app.use("/api/v1", apiRouter)

// Use the error handling middleware
app.use(notFoundHandler)
app.use(errorHandler)

module.exports = app
