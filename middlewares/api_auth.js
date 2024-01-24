const { getUserByToken } = require("../components/functions")

const api_auth = async (req, res, next) => {
  const BEARER_PREFIX = "Bearer "
  res.locals.api_auth = {}
  let bearer_token = req.headers.authorization
  bearer_token =
    bearer_token && bearer_token.startsWith(BEARER_PREFIX)
      ? bearer_token.slice(BEARER_PREFIX.length)
      : null
  const [role, userId, auth] = await getUserByToken(bearer_token, req, res)
  if (userId && role && auth) {
    res.locals.api_auth[role] = auth
  }
  next()
}
module.exports = api_auth
