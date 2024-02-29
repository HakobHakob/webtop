const { DB } = require("../../../components/db")
const employeeResource = require("../../resources/employeeResource")
const settingsResources = require("../../resources/settingsResourse")
const userResource = require("../../resources/usersResourse")

const adminDataIndex = async (req, res, next) => {
  const items = {
    settings: settingsResources,
    users: userResource,
    employees: employeeResource,
  }
  const sendData = { data: {}, errors: {} }
  for (const item in items) {
    if (item in req.body) {
      try {
        // let d = req.body[item] ? JSON.parse(req.body[item]) : {page: 1, perPage: 10};
        // let {page = 1, perPage = 10} = d;

        let { page, perPage, id, key, name } = req.body[item]
          ? JSON.parse(req.body[item])
          : {}
        id = Array.isArray(id) ? id : []
        key = Array.isArray(key) ? key : []
        name = Array.isArray(name) ? name : []

        const paginate = !!(page || perPage)
        page = page || 1
        perPage = perPage || 100
        perPage = Math.min(perPage, 100) // beri 100 grancum
        let sqlData
        let count = await DB(item)
          .when(id.length > 0, (query) => {
            query.orWhereIn("id", id)
          })
          .when(key.length > 0, (query) => {
            query.orWhereIn("key", key)
          })
          .when(name.length > 0, (query) => {
            query.orWhereIn("name", name)
          })
          .count()

        let lastPage = 1
        if (paginate) {
          lastPage = Math.ceil(count / perPage)
          sqlData = await DB(item)
            .when(id.length > 0, (query) => {
              query.orWhereIn("id", id)
            })
            .when(key.length > 0, (query) => {
              query.orWhereIn("key", key)
            })
            .when(name.length > 0, (query) => {
              query.orWhereIn("name", name)
            })
            .paginate(page, perPage)
            .get()
        } else {
          sqlData = await DB(item)
            .when(id.length > 0,  (query) => {
              query.orWhereIn("id", id)
            })
            .when(key.length > 0,  (query) => {
              query.orWhereIn("key", key)
            })
            .when(name.length > 0,  (query) => {
              query.orWhereIn("name", name)
            })
            .get()
        }
        sendData.data[item] = {
          data: await items[item](sqlData, res.locals.api_local),
          count: count,
          page: page,
          perPage: perPage,
          lastPage: lastPage,
        }
      } catch (e) {
        console.error(e)
        sendData.data[item] = null
        sendData.errors[item] = "Not a correct data or server side error."
      }
    }
  }
  return res.send(sendData)
}

module.exports = adminDataIndex
