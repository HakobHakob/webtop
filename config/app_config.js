require("dotenv").config()

const conf = {
  /*token cookie*/
  token: {
    table: "tokens",
    delimiter: "'",
    maxAge: 2 * 60 * 60 * 1000, // Stay logged in 2 * 60 * 60 * 1000 /two/ hours after last navigation
    // re_save: true,
    // refresh: true,
    // refresh_timeout: 5 * 60 * 1000, //Refresh token every  5 minutes
  },

  api: {
    renewal: true,
    refresh: false,
    refreshTime: 5 * 60 * 1000,
  },
  web: {
    prefix: "ses",
    renewal: true, //if true: last request time add maxAge to token expire.
    refresh: true, //if true: refresh token every refreshTime.
    refreshTime: 5 * 60 * 1000,
  },
  log: {
    format: "yyyy_MM_DD",
    ext: ".log",
    path: "logs",
  },

  lang: {
    default: "hy",
    all: { hy: "Հայերեն", en: "English", ru: "Русский" },
  },
  mail: {
    transporter: {
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      // secure: true,
      secureConnection: false, // TLS requires secureConnection to be false
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    },
    from: process.env.MAIL_FROM_ADDRESS,
  },
  database: {
    development: {
      host: process.env.DEV_HOST ?? "localhost",
      user: process.env.DEV_DB_USER ?? "root",
      port: process.env.DEV_DB_PORT ?? 3306,
      password: process.env.DEV_DB_PASS ?? "",
      database: process.env.DEV_DB ?? "webtop_db",
    },
    test: {
      host: process.env.TEST_HOST ?? "localhost",
      user: process.env.TEST_DB_USER ?? "root",
      port: process.env.TEST_DB_PORT ?? 3306,
      password: process.env.TEST_DB_PASS ?? "",
      database: process.env.TEST_DB ?? "webtop_db_test",
    },
    production: {
      host: process.env.PROD_HOST ?? "localhost",
      user: process.env.PROD_DB_USER ?? "root",
      port: process.env.PROD_DB_PORT ?? 3306,
      password: process.env.PROD_DB_PASS ?? "",
      database: process.env.PROD_DB ?? "webtop_db",
    },
  },
}

module.exports = { conf }
