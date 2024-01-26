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
    prefix: "_t_ses",
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
}

module.exports = { conf }
