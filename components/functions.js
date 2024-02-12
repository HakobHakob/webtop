const bcrypt = require("bcrypt")
const { User } = require("../models")
const db = require("../models")
const { boolean } = require("joi")
const { conf } = require("../config/app_config")
const fs = require("node:fs")
const path = require("node:path")
const queryInterface = db.sequelize.getQueryInterface()

const getTokenData = async (userId, role, token) => {
  let userSessions =
    userId && role && token
      ? await queryInterface.select(null, conf.token.table, {
          where: { user_id: userId, role: role },
        })
      : []
  return userSessions.filter((ses) => {
    return bcrypt.compareSync(token, ses.token)
  })
}

const getApiAuth = async (req, res) => {
  const BEARER_PREFIX = "Bearer "
  let bearerToken = req.headers.authorization
  bearerToken =
    bearerToken && bearerToken.startsWith(BEARER_PREFIX)
      ? bearerToken.slice(BEARER_PREFIX.length)
      : null
  let [userId, role] = bearerToken
    ? bearerToken.split(conf.token.delimiter)
    : [null, null]
  let userSessions = await getTokenData(userId, role, bearerToken)

  for (const ses of userSessions) {
    let values = {},
      newToken = null
    if (conf.api.renewal) {
      values.updated_at = new Date()
    }
    let canRefresh = Boolean(
      conf.api.refresh &&
        (ses.refresh ?? new Date()) <
          new Date(new Date() - conf.api.refreshTime)
    )
    if (canRefresh) {
      let newTokens = generateToken(userId, role)
      newToken = newTokens.token
      values.token = newTokens.hashedToken
      values.refresh = new Date()
    }
    if (conf.api.renewal || canRefresh) {
      await queryInterface.bulkUpdate(conf.token.table, values, {
        token: ses.token,
        user_id: userId,
        role: role,
      })
    }
    let auth = await User.findOne({ where: { id: userId } })
    if (auth && userId && role) {
      return { auth, userId, role, newToken }
    }
  }
  return null
}

const getWebAuth = async (req, res) => {
  let authData = {}
  for (let key in req.cookies) {
    if (key.startsWith(conf.web.prefix + conf.token.delimiter)) {
      let sesToken = req.cookies[key]
      let [userId, role] = sesToken
        ? sesToken.split(conf.token.delimiter)
        : [null, null]
      let userSessions = await getTokenData(userId, role, sesToken)
      for (const ses of userSessions) {
        let values = {},
          token = sesToken,
          maxAge =
            conf.token.maxAge + ((ses.updated_at ?? new Date()) - new Date())
        let canRefresh = Boolean(
          conf.web.refresh &&
            (ses.refresh ?? new Date()) <
              new Date(new Date() - conf.web.refreshTime)
        )
        if (conf.web.renewal) {
          values.updated_at = new Date()
          maxAge = conf.token.maxAge
        }
        if (canRefresh) {
          let newTokens = generateToken(userId, role)
          token = newTokens.token
          values.token = newTokens.hashedToken
          values.refresh = new Date()
        }
        if (conf.web.renewal || canRefresh) {
          res.cookie(conf.web.prefix + conf.token.delimiter + role, token, {
            maxAge: maxAge,
            httpOnly: true,
          })
          await queryInterface.bulkUpdate(conf.token.table, values, {
            token: ses.token,
            user_id: userId,
            role: role,
          })
        }
        let auth = await User.findOne({ where: { id: userId } })
        if (userId && role && auth) {
          authData[role] = auth
        } else {
          res.cookie(key, "", { maxAge: -1 })
        }
      }
      if (!userSessions.length) {
        res.cookie(key, "", { maxAge: -1 })
      }
    }
  }

  return authData
}

const generateString = (str_length = 8) => {
  let str = ""
  const symbols =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@-+=@!"
  Array.from({ length: str_length }).forEach(() => {
    str += symbols[Math.floor(Math.random() * symbols.length)]
  })
  return str
}

const generateToken = (userId, role, tokenLength = 128) => {
  const symbols =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@.-+*&^%{}[]:|=()@!?<>"
  let token = userId + "'" + role + "'"
  const time = Date.now().toString()
  const coefficient = symbols.length / 10
  const arr_st = []
  Array.from({ length: 10 }).forEach((_, i) => {
    arr_st.push(Math.round(i * coefficient))
  })
  arr_st.push(symbols.length)

  time.split("").forEach((timeDigit) => {
    const parsedDigit = parseInt(timeDigit)
    const randomIndex =
      Math.floor(
        Math.random() * (arr_st[parsedDigit + 1] - arr_st[parsedDigit])
      ) + arr_st[parsedDigit]
    token += symbols[randomIndex]
  })

  Array.from({ length: tokenLength - time.length }).forEach(() => {
    token += symbols[Math.floor(Math.random() * symbols.length)]
  })
  const hashedToken = bcrypt.hashSync(token, 8)

  return { token, hashedToken }
}

const saveAndGetUserToken = async (userId, role = "user") => {
  let tokens = generateToken(userId, role)
  await saveToken(userId, role, tokens.hashedToken)
  return tokens.token
}

const loginUser = async (userId, req, res, role = "user") => {
  let tokens = generateToken(userId, role)
  res.cookie(conf.web.prefix + conf.token.delimiter + role, tokens.token, {
    maxAge: conf.token.maxAge,
    httpOnly: true,
  })
  await saveToken(userId, role, tokens.hashedToken)
}

const saveToken = async (userId, role, token) => {
  await queryInterface.bulkInsert(
    conf.token.table,
    [
      {
        user_id: userId,
        role: role,
        token: token,
        refresh_token_date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
    {}
  )
}

const logoutUser = async (userId, role, req, res) => {
  let key = conf.web.prefix + conf.token.delimiter + role
  if (key in req.cookies) {
    let token = req.cookies[key]
    let userSessions = await getTokenData(userId, role, token)
    for (const ses of userSessions) {
      await queryInterface.bulkDelete(
        conf.token.table,
        {
          token: ses.token,
          user_id: userId,
          role: role,
        },
        {}
      )
      res.cookie(key, "", { maxAge: -1 })
      return true
    }
  }
  return false
}

const apiLogoutUser = async (userId, role, req, res) => {
  const BEARER_PREFIX = "Bearer "
  let bearerToken = req.headers.authorization
  bearerToken =
    bearerToken && bearerToken.startsWith(BEARER_PREFIX)
      ? bearerToken.slice(BEARER_PREFIX.length)
      : null
  if (bearerToken) {
    let userSessions = await getTokenData(userId, role, bearerToken)
    for (const ses of userSessions) {
      await queryInterface.bulkDelete(
        conf.token.table,
        {
          token: ses.token,
          user_id: userId,
          role: role,
        },
        {}
      )
      return true
    }
  }
  return false
}

const makeDirectoryIfNotExists = async (path) => {
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

// const saveFileContent = (pathFileName, fileData) => {
//   try {
//     let dir = path.dirname(pathFileName)
//     makeDirectoryIfNotExists(dir)
//     fs.writeFileSync(pathFileName, fileData)
//     return true
//   } catch (e) {
//     console.error(e)
//     return false
//   }
// }

const __root = path.normalize(__dirname + "/..")
const __public = path.normalize(__dirname + "/../public")

const getAllFilesAndDirs = (startPath) => {
  let deltaPath = arguments.length > 1 ? startPath : ""
  startPath = arguments.length > 1 ? arguments[1] : startPath
  let slash = deltaPath ? "/" : ""
  let fullPath = startPath + slash + deltaPath
  let files = [],
    dirs = []
  let filesOrDirs = fs.readdirSync(fullPath)
  for (let fileOrDir of filesOrDirs) {
    let newPath = fullPath + "/" + fileOrDir
    if (fs.statSync(newPath).isFile()) {
      files.push({ path: fullPath, file: fileOrDir, relativePath: deltaPath })
    } else if (fs.statSync(newPath).isDirectory()) {
      let incoming = getAllFilesAndDirs(
        deltaPath + slash + fileOrDir,
        startPath
      )
      files.push(...incoming.files)
      dirs.push(
        { path: fullPath, dir: fileOrDir, relativePath: deltaPath },
        ...incoming.dirs
      )
    }
  }
  return { files, dirs }
}

module.exports = {
  getApiAuth,
  getWebAuth,
  saveAndGetUserToken,
  loginUser,
  logoutUser,
  apiLogoutUser,
  generateString,
  getAllFilesAndDirs,
  makeDirectoryIfNotExists,
  __root,
  __public,
}
