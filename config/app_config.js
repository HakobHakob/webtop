const conf = {
  /*token cookie*/
  cookie: {
    ses_table_name: "tokens",
    prefix: "_t_ses",
    delimiter: "'",
    maxAge: 2 * 60 * 60 * 1000, // Stay logged in 2 * 60 * 60 * 1000 /two/ hours after last navigation
    re_save: true,
    refresh: true,
    refresh_timeout: 5 * 60 * 1000, //Refresh token every  5 minutes
  },
  lang: {
    default: "hy",
    all: { hy: "Հայերեն", en: "English", ru: "Русский" },
  },
}

module.exports = { conf }
