const { User } = require("../models")
const { conf } = require("../config/app_config")
const db = require("../models")
const queryInterface = db.sequelize.getQueryInterface()
const bcrypt = require("bcrypt")

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
  return [token, hashedToken]
}

const saveAndGetUserToken = async (userId, role = "user") => {
  const tokens = generateToken(userId, role)
  await saveToken(userId, role, tokens[1])
  return tokens[0]
}

const loginUser = async (userId, req, res, role = "user") => {
  const tokens = generateToken(userId, role)
  res.cookie(conf.cookie.prefix + conf.cookie.delimiter + role, tokens[0], {
    maxAge: conf.cookie.maxAge,
    httpOnly: true,
  })
  await saveToken(userId, role, tokens[1])
}

const getUserByToken = async (token, req, res, can_refresh_token = false) => {
  let [userId, role] = token ? token.split(conf.cookie.delimiter) : [null, null]
  let userSessions =
    userId && role
      ? await queryInterface.select(null, conf.cookie.ses_table_name, {
          where: { user_id: userId, role: role },
        })
      : []
  for (const ses of userSessions) {
    if (bcrypt.compareSync(token, ses.token)) {
      let values = { updated_at: new Date() }
      let toRefresh = Boolean(
        can_refresh_token &&
          (ses.refresh_token_date ?? new Date()) <
            new Date(new Date() - conf.cookie.refresh_timeout)
      )
      if (toRefresh) {
        let newTokens = generateToken(userId, role)
        values.token = newTokens[1]
        values.refresh_token_date = new Date()
        token = newTokens[0]
      }
      if (conf.cookie.re_save || toRefresh) {
        await queryInterface.bulkUpdate(conf.cookie.ses_table_name, values, {
          token: ses.token,
          user_id: userId,
          role: role,
        })
        res.cookie(conf.cookie.prefix + conf.cookie.delimiter + role, token, {
          maxAge: conf.cookie.maxAge,
          httpOnly: true,
        })
      }
      let auth = await User.findOne({ where: { id: userId } })
      if (auth) {
        return [role, userId, auth]
      }
    }
  }
  return [null, null, null]
}

const saveToken = async (userId, role, token) => {
  await queryInterface.bulkInsert(
    conf.cookie.ses_table_name,
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
  const cookie_key = conf.cookie.prefix + conf.cookie.delimiter + role
  if (cookie_key in req.cookies) {
    let userSessions = await queryInterface.select(
      null,
      conf.cookie.ses_table_name,
      {
        where: {
          user_id: userId,
          role: role,
        },
      }
    )
    for (const ses of userSessions) {
      if (bcrypt.compareSync(req.cookies[cookie_key], ses.token)) {
        await queryInterface.bulkDelete(
          conf.cookie.ses_table_name,
          {
            token: ses.token,
            user_id: userId,
            role: role,
          },
          {}
        )
        res.cookie(cookie_key, "", { maxAge: -1 })
      }
    }
  }
}

const apiLogoutUser = async (userId, role, req, res) => {
  const BEARER_PREFIX = "Bearer "
  let bearer_token = req.headers.authorization
  bearer_token =
    bearer_token && bearer_token.startsWith(BEARER_PREFIX)
      ? bearer_token.slice(BEARER_PREFIX.length)
      : null
  if (bearer_token) {
    let userSessions = await queryInterface.select(
      null,
      conf.cookie.ses_table_name,
      {
        where: {
          user_id: userId,
          role: role,
        },
      }
    )
    for (const ses of userSessions) {
      if (bcrypt.compareSync(bearer_token, ses.token)) {
        await queryInterface.bulkDelete(
          conf.cookie.ses_table_name,
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
  }
  return false
}

module.exports = {
  generateToken,
  saveAndGetUserToken,
  loginUser,
  getUserByToken,
  logoutUser,
  apiLogoutUser,
}
