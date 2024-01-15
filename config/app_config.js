const conf = {
  /*token cookie*/
  cookie: {
    ses_table_name: "sessions",
    prefix: "_t_ses",
    delimiter: "'",
    maxAge: 2 * 60 * 60 * 1000,
    re_save: true,
  },
}

module.exports = { conf }
