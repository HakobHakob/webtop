const { DB } = require("../../../components/db")
const {
  settingsIndex,
  settingsCollection,
} = require("../../resources/settingsResourse")

const { teamsIndex, teamsCollection } = require("../../resources/teamsResourse")
const { usersIndex, usersCollection } = require("../../resources/usersResourse")

const adminDataIndex = async (req, res, next) => {
  {
    let items = {
      settings: { index: settingsIndex, collection: settingsCollection },
      users: { index: usersIndex, collection: usersCollection },
      teams: { index: teamsIndex, collection: teamsCollection },
    }
    let sendData = { data: {}, errors: {} }
    for (let item in items) {
      if (item in req.body) {
        try {
          let requestData = req.body[item]
            ? JSON.parse(req.body[item])
            : { page: 1, perPage: 10 }
          let { page = 1, perPage = 10 } = requestData
          let sqlData = await DB(item).paginate(page, perPage).get()
          sendData.data[item] = await items[item].collection(
            sqlData,
            res.locals.$api_local
          )
        } catch (e) {
          console.error(e)
          sendData.data[item] = null
          sendData.errors[item] = "Not a correct data or server side error."
        }
      }
    }
    return res.send(sendData)
  }
}

module.exports = adminDataIndex
