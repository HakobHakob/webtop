const conf = {
  /*token cookie*/
  cookie: {
    ses_table_name: "tokens",
    prefix: "_t_ses",
    delimiter: "'",
    maxAge: 2 * 60 * 60 * 1000,
    re_save: true,
    refresh: true,
    refresh_timeout: 60 * 1000,
  },
  lang: {
    default: "hy",
    all: { hy: "Հայերեն", en: "English", ru: "Русский" },
  },
}

module.exports = { conf }
