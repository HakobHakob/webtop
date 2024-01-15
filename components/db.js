const mysql = require('mysql');
const mysql_sync = require('sync-mysql') ;

const DB = (query) => {
  try {
    const connection = new mysql_sync({
      host: "localhost",
      user: "root",
      port: 3306,
      password: "",
      database: "webtop_db",
    })
    return connection.query(query)
  } catch (e) {
    return { error: e }
  }
}

// const products = DB("SELECT * FROM products LIMIT 3")
// console.log("products", products)

module.exports = { DB }
