const bcrypt = require("bcrypt")
const { conf } = require("../config/app_config")
const fs = require("node:fs")
const path = require("node:path")
const { DB } = require("./db")
const moment = require("moment")

const getTokenData = async (userId, role, token) => {
  let userSessions = []
  try {
    userSessions =
      userId && role && token
        ? await DB(conf.token.table)
            .where("user_id", userId)
            .where("role", role)
            .get()
        : []
  } catch (e) {
    console.error(e)
  }
  return userSessions.filter((ses) => bcrypt.compareSync(token, ses.token))
}

const getApiAuth = async (req, res) => {
  const BEARER_PREFIX = "Bearer "
  let bearerToken = req.headers.authorization
  bearerToken =
    bearerToken && bearerToken.startsWith(BEARER_PREFIX)
      ? bearerToken.slice(BEARER_PREFIX.length)
      : null
  const [userId, role] = bearerToken
    ? bearerToken.split(conf.token.delimiter)
    : [null, null]
  let userSessions = await getTokenData(userId, role, bearerToken)

  for (const ses of userSessions) {
    const values = {},
      newToken = null
    if (conf.api.renewal) {
      values.updated_at = moment().format("yyyy-MM-DD HH:mm:ss")
    }
    const canRefresh = Boolean(
      conf.api.refresh &&
        new Date(ses.refresh ?? moment().format("yyyy-MM-DD HH:mm:ss")) <
          new Date(new Date() - conf.api.refreshTime)
    )
    if (canRefresh) {
      let newTokens = generateToken(userId, role)
      newToken = newTokens.token
      values.token = newTokens.hashedToken
      values.refresh = moment().format("yyyy-MM-DD HH:mm:ss")
    }
    if (conf.api.renewal || canRefresh) {
      try {
        await DB(conf.token.table)
          .where("token", ses.token)
          .where("user_id", userId)
          .where("role", role)
          .update(values)
      } catch (e) {
        console.error(e)
      }
    }
    let auth
    try {
      auth = await DB("users").find(userId)
    } catch (error) {
      console.error(error)
    }
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
      const sesToken = req.cookies[key]
      const [userId, role] = sesToken
        ? sesToken.split(conf.token.delimiter)
        : [null, null]
      const userSessions = await getTokenData(userId, role, sesToken)
      for (const ses of userSessions) {
        let values = {},
          token = sesToken,
          maxAge =
            conf.token.maxAge + ((ses.updated_at ?? new Date()) - new Date())
        let canRefresh = Boolean(
          conf.web.refresh &&
            new Date(ses.refresh ?? moment().format("yyyy-MM-DD HH:mm:ss")) <
              new Date(new Date() - conf.web.refreshTime)
        )
        if (conf.web.renewal) {
          values.updated_at = moment().format("yyyy-MM-DD HH:mm:ss")
          maxAge = conf.token.maxAge
        }
        if (canRefresh) {
          const newTokens = generateToken(userId, role)
          token = newTokens.token
          values.token = newTokens.hashedToken
          values.refresh = moment().format("yyyy-MM-DD HH:mm:ss")
        }
        if (conf.web.renewal || canRefresh) {
          res.cookie(conf.web.prefix + conf.token.delimiter + role, token, {
            maxAge: maxAge,
            httpOnly: true,
          })

          try {
            await DB(conf.token.table)
              .where("token", ses.token)
              .where("user_id", userId)
              .where("role", role)
              .update(values)
          } catch (e) {
            console.error(e)
          }
        }
        let auth = null
        try {
          auth = await DB("users").find(userId)
        } catch (e) {
          console.error(e)
        }
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
  const tokens = generateToken(userId, role)
  await saveToken(userId, role, tokens.hashedToken)
  return tokens.token
}

const loginUser = async (userId, res, role = "user") => {
  const tokens = generateToken(userId, role)

  res.cookie(conf.web.prefix + conf.token.delimiter + role, tokens.token, {
    maxAge: conf.token.maxAge,
    httpOnly: true,
  })
  await saveToken(userId, role, tokens.hashedToken)
}

const saveToken = async (userId, role, token) => {
  try {
    await DB(conf.token.table).create({
      user_id: userId,
      role,
      token,
      refresh_token_date: moment().format("yyyy-MM-DD HH:mm:ss"),
      updated_at: moment().format("yyyy-MM-DD HH:mm:ss"),
    })
  } catch (e) {
    console.error(e)
  }
}

const logoutUser = async (userId, role, req, res) => {
  let key = conf.web.prefix + conf.token.delimiter + role
  if (key in req.cookies) {
    const token = req.cookies[key]
    const userSessions = await getTokenData(userId, role, token)
    for (const ses of userSessions) {
      try {
        await DB(conf.token.table)
          .where("tokens", ses.token)
          .where("user_id", userId)
          .where("role", role)
          .delete()
        res.cookie(key, "", { maxAge: -1 })
        return true
      } catch (e) {
        console.error(e)
      }
    }
  }
  return false
}

const apiLogoutUser = async (userId, role, req) => {
  const BEARER_PREFIX = "Bearer "
  let bearerToken = req.headers.authorization
  bearerToken =
    bearerToken && bearerToken.startsWith(BEARER_PREFIX)
      ? bearerToken.slice(BEARER_PREFIX.length)
      : null
  if (bearerToken) {
    const userSessions = await getTokenData(userId, role, bearerToken)
    for (const ses of userSessions) {
      try {
        await DB(conf.token.table)
          .where("token", ses.token)
          .where("user_id", userId)
          .where("role", role)
          .delete()
        return true
      } catch (e) {
        console.error(e)
      }
    }
  }
  return false
}

const makeDirectoryIfNotExists = async (path) => {
  const pathArr = path.split(/[/\\]/gi)
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
  const deltaPath = arguments.length > 1 ? startPath : ""
  startPath = arguments.length > 1 ? arguments[1] : startPath
  const slash = deltaPath ? "/" : ""
  const fullPath = startPath + slash + deltaPath
  const files = []
  const dirs = []
  const filesOrDirs = fs.readdirSync(fullPath)
  for (const fileOrDir of filesOrDirs) {
    const newPath = fullPath + "/" + fileOrDir
    if (fs.statSync(newPath).isFile()) {
      files.push({ path: fullPath, file: fileOrDir, relativePath: deltaPath })
    } else if (fs.statSync(newPath).isDirectory()) {
      const incoming = getAllFilesAndDirs(
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
