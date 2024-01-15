const { User } = require("../models")
const { conf } = require("../config/app_config")
const db = require("../models")
const queryInterface = db.sequelize.getQueryInterface()

const generateToken = (userId, role, tokenLength = 128) => {
  let words =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@.-+*&^%{}[]:|=()"
  let timeWords = "$#@.-+*&^%"
  let token = userId + "'" + role + "'"
  let time = Date.now().toString()
  for (let i = 0; i < time.length; i++) {
    token += timeWords[parseInt(time[i])]
  }
  for (let i = 0; i < tokenLength - time.length; i++) {
    token += words[Math.floor(Math.random() * words.length)]
  }
  let hashedToken = bcrypt.hashSync(token, 8)
  return [token, hashedToken]
}

const loginUser = async (userId, req, res, role = "user") => {
  let tokens = generateToken(userId, role)
  // req.session.tokens = {...(req.session.tokens ?? {}), [role]: tokens[0]};
  res.cookie(conf.cookie.prefix + conf.cookie.delimiter + role, tokens[0], {
    maxAge: conf.cookie.maxAge,
    httpOnly: true,
  })
  await saveToken(userId, role, tokens[1])
}

const getUserByToken = async (token) => {
  let userId = token ? token.split(conf.cookie.delimiter)[0] : null
  let userSessions = await queryInterface.select(
    null,
    conf.cookie.ses_table_name,
    { where: { user_id: userId } }
  )

  for (const ses of userSessions) {
    if (bcrypt.compareSync(token, ses.token)) {
      if (conf.cookie.re_save) {
        await queryInterface.bulkUpdate(
          conf.cookie.ses_table_name,
          { updated_at: new Date() },
          {
            token: ses.token,
            user_id: userId,
            role: ses.role,
          }
        )
      }
      return await User.findOne({ where: { id: userId } })
    }
  }

  return null
}

const saveToken = async (userId, role, token) => {
  await queryInterface.bulkInsert(
    conf.cookie.ses_table_name,
    [
      {
        user_id: userId,
        role: role,
        token: token,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
    {}
  )
  // if(userId in global.usersTokens && Array.isArray(global.usersTokens[userId])){
  //     global.usersTokens[userId].push(token);
  // }else{
  //     global.usersTokens[userId] = [token];
  // }
}

const logoutUser = async (userId, role, req, res) => {
  let cookie_key = conf.cookie.prefix + conf.cookie.delimiter + role
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
    // console.log(userSessions);
  }
  // await queryInterface.bulkDelete('sessions', null, {where: {user_id: userId, role: role}});
  // res.cookie('_t_ses\'' + role, '', {maxAge: -1});
}

module.exports = { generateToken, loginUser, getUserByToken, logoutUser }
