const mysql = require("mysql")
const mysql_sync = require("sync-mysql")
require("dotenv").config()
const { conf } = require("../config/app_config")

const _val = (value) => {
  return value === null
    ? "NULL"
    : typeof value === "boolean"
    ? value
      ? 1
      : 0
    : value === undefined
    ? ""
    : "'" + value + "'"
}

const _col = (column) => {
  return "`" + column + "`"
}

const _whereHas = (
  _this,
  and_or,
  relationTable,
  selfColumn,
  relationColumn,
  fn = null
) => {
  _this._conditions.push(and_or)
  let exists = "EXISTS (SELECT * FROM"
  let query = new DBClass(relationTable)
  if (fn && typeof fn === "function") {
    fn(query)
    if (query._conditions.length > 0) {
      query._conditions[0] = "AND ("
      query._conditions.push(")")
    }
    query._conditions.unshift(
      and_or,
      _this._table + "." + _col(selfColumn),
      "=",
      query._table + "." + _col(relationColumn)
    )
    let rel_q = query._all_q()
    if (rel_q) {
      exists += rel_q
    }
  } else {
    query._conditions.push(
      and_or,
      _this._table + "." + _col(selfColumn),
      "=",
      query._table + "." + _col(relationColumn)
    )
  }
  _this._conditions.push(exists + ")")
  return _this
}

const _where = (_this, and_or, columnOrFn, condOrVal, val) => {
  let argLen = arguments.length - 2
  if (argLen === 1 && typeof columnOrFn === "function") {
    let query = new DBClass(_this._tableName)
    columnOrFn(query)
    if (query._conditions.length > 0) {
      query._conditions[0] = "("
      query._conditions.push(")")
      _this._conditions.push(and_or, ...query._conditions)
    }
  } else if (argLen === 2) {
    _this._conditions.push(
      and_or,
      _this._table + "." + _col(columnOrFn),
      "=",
      _val(condOrVal)
    )
  } else if (argLen > 2) {
    _this._conditions.push(
      and_or,
      _this._table + "." + _col(columnOrFn),
      condOrVal,
      _val(val)
    )
  }
  return _this
}

const executeQuery = (query) => {
  const mode = process.env.NODE_ENV ?? "production"
  const config = conf.database[mode]
  return new Promise((resolve, reject) => {
    let con = mysql.createConnection(config)
    con.connect(function (err) {
      if (err) {
        reject(err)
      }
      con.query(query, function (err, result) {
        if (err) {
          reject(err)
        }
        resolve(result)
      })
    })
  })
}

class DBClass {
  //"SELECT * FROM products WHERE disable = 0 LIMIT 10"
  constructor(table) {
    this._tableName = table
    this._table = _col(table)
    this._r_table = null
    this._table_r = null
    this._conditions = []
    this._orders = []
    this._limit = null
    this._paginate = null
    this._add_to_end = null
  }

  where(columnOrFn, condOrVal, val) {
    let and_or = "AND"
    return _where(this, and_or, ...arguments)
  }

  orWhere(column, condOrVal, val) {
    let and_or = "OR"
    return _where(this, and_or, ...arguments)
  }

  whereBetween(column, value1, value2) {
    if (arguments.length < 3) {
      return this
    }
    this._conditions.push(
      "AND",
      this._table + "." + _col(column),
      "BETWEEN",
      _val(value1),
      "AND",
      _val(value2)
    )
    return this
  }

  orWhereBetween(column, value1, value2) {
    if (arguments.length < 3) {
      return this
    }
    this._conditions.push(
      "OR",
      this._table + "." + _col(column),
      "BETWEEN",
      _val(value1),
      "AND",
      _val(value2)
    )
    return this
  }

  whereNotBetween(column, value1, value2) {
    if (arguments.length < 3) {
      return this
    }
    this._conditions.push(
      "AND",
      this._table + "." + _col(column),
      "NOT BETWEEN",
      _val(value1),
      "AND",
      _val(value2)
    )
    return this
  }

  orWhereNotBetween(column, value1, value2) {
    if (arguments.length < 3) {
      return this
    }
    this._conditions.push(
      "OR",
      this._table + "." + _col(column),
      "NOT BETWEEN",
      _val(value1),
      "AND",
      _val(value2)
    )
    return this
  }

  whereNotNull(column) {
    if (arguments.length < 1) {
      return this
    }
    this._conditions.push(
      "AND",
      this._table + "." + _col(column),
      "IS NOT NULL"
    )
    return this
  }

  orWhereNotNull(column) {
    if (arguments.length < 1) {
      return this
    }
    this._conditions.push("OR", this._table + "." + _col(column), "IS NOT NULL")
    return this
  }

  whereNull(column) {
    if (arguments.length < 1) {
      return this
    }
    this._conditions.push("AND", this._table + "." + _col(column), "IS NULL")
    return this
  }

  orWhereNull(column) {
    if (arguments.length < 1) {
      return this
    }
    this._conditions.push("OR", this._table + "." + _col(column), "IS NULL")
    return this
  }

  whereIn(column, arr) {
    if (arguments.length < 2 || !Array.isArray(arr)) {
      return this
    }
    arr = arr.map((ar, i) => {
      return _val(ar)
    })
    this._conditions.push(
      "AND",
      this._table + "." + _col(column),
      "IN(",
      arr.join(", ") + ")"
    )
    return this
  }

  whereNotIn(column, arr) {
    if (arguments.length < 2 || !Array.isArray(arr)) {
      return this
    }
    arr = arr.map((ar, i) => {
      return _val(ar)
    })
    this._conditions.push(
      "AND",
      this._table + "." + _col(column),
      "NOT IN(",
      arr.join(", ") + ")"
    )
    return this
  }

  orWhereIn(column, arr) {
    if (arguments.length < 2 || !Array.isArray(arr)) {
      return this
    }
    arr = arr.map((ar, i) => {
      return _val(ar)
    })
    this._conditions.push(
      "OR",
      this._table + "." + _col(column),
      "IN(",
      arr.join(", ") + ")"
    )
    return this
  }

  orWhereNotIn(column, arr) {
    if (arguments.length < 2 || !Array.isArray(arr)) {
      return this
    }
    arr = arr.map((ar, i) => {
      return _val(ar)
    })
    this._conditions.push(
      "OR",
      this._table + "." + _col(column),
      "NOT IN(",
      arr.join(", ") + ")"
    )
    return this
  }

  orderBy(column, ascOrDesc = "ASC") {
    if (
      arguments.length < 2 ||
      (ascOrDesc.toUpperCase() !== "ASC" && ascOrDesc.toUpperCase() !== "DESC")
    ) {
      return this
    }
    this._orders.push(
      this._table + "." + _col(column) + " " + ascOrDesc.toUpperCase()
    )
    return this
  }

  limit = (limitValue) => {
    if (limitValue !== undefined) {
      _limit = limitValue
    }
  }

  paginate(page, perPage) {
    if (page && perPage) {
      this._paginate = { page, perPage }
    }
    return this
  }

  whereHas(relationTable, selfColumn, relationColumn, fn = null) {
    let and_or = "AND"
    return _whereHas(
      this,
      and_or,
      relationTable,
      selfColumn,
      relationColumn,
      fn
    )
  }

  orWhereHas(relationTable, selfColumn, relationColumn, fn = null) {
    let and_or = "OR"
    return _whereHas(
      this,
      and_or,
      relationTable,
      selfColumn,
      relationColumn,
      fn
    )
  }

  get(columns = this._table + "." + "*") {
    if (Array.isArray(columns)) {
      columns = columns.map((col) => this._table + "." + _col(col)).join(", ")
    }
    this._r_table = "SELECT " + columns + " FROM"
    return this._queryBuilder()
  }

  delete() {
    this._r_table = "DELETE FROM"
    return this._queryBuilder()
  }

  update(obj = {}) {
    this._r_table = "UPDATE"
    this._table_r = "SET"
    let set = []
    if (
      typeof obj === "object" &&
      obj !== null &&
      Object.keys(obj).length > 0
    ) {
      for (let column in obj) {
        set.push(_col(column) + " = " + _val(obj[column]))
      }
      this._table_r = "SET " + set.join(", ")
    }
    return this._queryBuilder()
  }

  create(obj = {}) {
    this._r_table = "INSERT INTO"
    if (Array.isArray(obj) && obj.length > 0) {
      let columns = [],
        all_values = []
      for (let column in obj[0]) {
        columns.push(column)
      }
      obj.forEach((objItem) => {
        let values = []
        columns.forEach((column) => {
          values.push(_val(objItem[column]))
        })
        all_values.push("(" + values.join(", ") + ")")
      })
      this._table_r =
        "(" + columns.join(", ") + ") VALUES " + all_values.join(", ")
    } else if (
      typeof obj === "object" &&
      obj !== null &&
      Object.keys(obj).length > 0
    ) {
      let columns = [],
        values = []
      for (let column in obj) {
        columns.push(_col(column))
        values.push(_val(obj[column]))
      }
      this._table_r =
        "(" +
        columns.map((column) => _col(column)).join(", ") +
        ") VALUES (" +
        values.join(", ") +
        ")"
    }
    return this._queryBuilder()
  }

  async find(id, columns = this._table + "." + "*") {
    if (Array.isArray(columns)) {
      columns = columns.map((col) => this._table + "." + _col(col)).join(", ")
    }
    this._r_table = "SELECT " + columns + " FROM"
    this._limit = 1
    if (arguments.length > 0 && id !== undefined && isFinite(id)) {
      this._conditions.push("AND", _col("id"), "=", _val(id))
    }
    let answer = await this._queryBuilder()
    return answer.length > 0 ? answer[0] : null
  }

  async first(columns = this._table + "." + "*") {
    if (Array.isArray(columns)) {
      columns = columns.map((col) => this._table + "." + _col(col)).join(", ")
    }
    this._r_table = "SELECT " + columns + " FROM"
    this._limit = 1
    let answer = await this._queryBuilder()
    return answer.length > 0 ? answer[0] : null
  }

  async count() {
    this._r_table = "SELECT COUNT(*) FROM"
    let answer = await this._queryBuilder()
    return answer[0][Object.keys(answer[0])[0]]
  }

  async exists() {
    this._r_table = "SELECT EXISTS (SELECT " + this._table + ".* FROM"
    this._add_to_end = ")"
    let answer = await this._queryBuilder()
    return answer[0][Object.keys(answer[0])[0]] !== 0
  }

  async sum(column) {
    this._r_table = "SELECT SUM(" + this._table + "." + _col(column) + ") FROM"
    let answer = await this._queryBuilder()
    return answer[0][Object.keys(answer[0])[0]]
  }

  truncate() {
    this._r_table = "TRUNCATE TABLE"
    return this._queryBuilder()
  }

  createTable(obj) {
    if (!obj || typeof obj !== "object") {
      return null
    }
    this._r_table = "CREATE TABLE"
    this._table_r = "("
    let table_r_arr = []
    for (let column in obj) {
      table_r_arr.push(_col(column) + " " + obj[column])
    }
    // this._table_r += "PersonID int, LastName varchar(255), Address varchar(255), City varchar(255)";
    this._table_r += table_r_arr.join(", ")
    this._table_r += ")"
    return this._queryBuilder()
  }

  static dataTypes() {
    let _dataTypes = [
      "bigint",
      "binary",
      "bit",
      "blob",
      "char",
      "date",
      "datetime",
      "decimal",
      "double",
      "enum",
      "float",
      "geometry",
      "geometrycollection",
      "int",
      "integer",
      "json",
      "linestring",
      "longblob",
      "longtext",
      "mediumblob",
      "mediumint",
      "mediumtext",
      "multilinestring",
      "multipoint",
      "multipolygon",
      "numeric",
      "point",
      "polygon",
      "real",
      "set",
      "smallint",
      "text",
      "time",
      "timestamp",
      "tinyblob",
      "tinyint",
      "tinytext",
      "varbinary",
      "varchar",
      "year",
    ]
    let q_str = ""
    let secondHandle = {
      nullable: function () {
        q_str += " DEFAULT NULL"
        return q_str
      },
      default: function (def) {
        q_str += " DEFAULT " + _val(def)
        return q_str
      },
      ablab: "qwerty",
      tblab: "asdfgh",
    }
    let firstHandle = {}
    _dataTypes.forEach((dataType) => {
      firstHandle[dataType] = function () {
        q_str += dataType + "(" + [...arguments].join(", ") + ")"
        return secondHandle
      }
    })
    // return firstHandle;
    return {
      bigint: f,
      binary: f,
      bit: f,
      blob: f,
      char: f,
      date: f,
      datetime: f,
      decimal: f,
      double: f,
      enum: f,
      float: f,
      geometry: f,
      geometrycollection: f,
      int: f,
      integer: f,
      json: f,
      linestring: f,
      longblob: f,
      longtext: f,
      mediumblob: f,
      mediumint: f,
      mediumtext: f,
      multilinestring: f,
      multipoint: f,
      multipolygon: f,
      numeric: f,
      point: f,
      polygon: f,
      real: f,
      set: f,
      smallint: f,
      text: f,
      time: f,
      timestamp: f,
      tinyblob: f,
      tinyint: f,
      tinytext: f,
      varbinary: f,
      varchar: f,
      year: f,
    }
    function f() {
      q_str += "dataType" + "(" + [...arguments].join(", ") + ")"
      return secondHandle
    }
  }

  _queryBuilder() {
    return executeQuery(this._all_q())
  }

  _all_q() {
    let pre_q = [this._r_table, this._table].join(" ") + " "
    let all_q = pre_q + this._q()
    console.log("all_q=", all_q)
    return all_q
  }

  _q() {
    let qArr = []
    this._table_r !== null ? qArr.push(this._table_r) : null
    if (this._conditions.length > 0) {
      this._conditions[0] = "WHERE"
      qArr.push(...this._conditions)
    }
    if (this._orders.length > 0) {
      qArr.push("ORDER BY")
      qArr.push(this._orders.join(", "))
    }
    if (this._limit !== null) {
      qArr.push("LIMIT " + this._limit)
    } else if (this._paginate !== null) {
      qArr.push("LIMIT " + this._paginate.perPage)
    }
    if (this._paginate !== null) {
      qArr.push("OFFSET " + this._paginate.perPage * (this._paginate.page - 1))
    }
    this._add_to_end !== null ? qArr.push(this._add_to_end) : null
    let q = qArr.join(" ")
    // console.log('q=', q);
    return q
  }
}

const DB = (table) => {
  return new DBClass(table)
}

Object.getOwnPropertyNames(DBClass)
  // .filter(prop => typeof DBClass[prop] === "function")
  .forEach((staticMethod) => {
    DB[staticMethod] = DBClass[staticMethod]
  })

// exports.executeQuery=executeQuery;
module.exports = { executeQuery, DB }
