const cron = require("node-cron")
const { conf } = require("../config/app_config")
const { DB } = require("../components/db")
const moment = require("moment")

cron.schedule("*/5 * * * *", async () => {
  //running every 5 minutes
  try {
    await DB(conf.token.table)
      .where(
        "updated_at",
        "<",
        moment().subtract(conf.token.maxAge, "ms").format("yyyy-MM-DD HH:mm:ss")
      )
      .delete()
  } catch (e) {
    console.error(e)
  }
  // console.log('cron running at ' + moment().format('yyyy_MM_DD-HH:mm:ss'));
})
