const express = require("express")
const app = express()
const path = require("path")
const cookieParser = require("cookie-parser")
// const log = require("./logger/logger")
const session = require("express-session")
const bodyParser = require("body-parser")
global.__basedir = __dirname
const webRouter = require("./routes/web")
const apiRouter = require("./routes/api_v1")
const mediaRouter = require("./routes/api_v1_media")

const authMiddleware = require("./middlewares/authMiddleware")
const api_auth = require("./middlewares/api_auth")
const {
  notFoundHandler,
  errorHandler,
} = require("./middlewares/errorMiddleware")
// log.info("This is an information message.")

// configure our .env file
const dotenv = require("dotenv")
dotenv.config({ path: "./.env" })

// Install ejs
app.use(require("express-ejs-layouts"))
app.set("layout", "layouts/includes/contentTemplate")
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
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

app.use(bodyParser.urlencoded({ extended: true }))

app.use(authMiddleware)
app.use(api_auth)

app.use("/", webRouter)
app.use("/api/v1", apiRouter)
app.use("/api/v1/media", mediaRouter)

// Use the error handling middleware
app.use(notFoundHandler)
app.use(errorHandler)

module.exports = app
