const mysql = require("mysql")
const mysql2 = require("mysql2")
require("dotenv").config()
const { conf } = require("../config/app_config")

function _val(value) {
  if (value === null) {
    return "NULL"
  } else if (typeof value === "boolean") {
    return value ? 1 : 0
  } else if (value === undefined) {
    return ""
  }
  return "'" + value + "'"
}

function _col(column) {
  return "`" + column + "`"
}

function _whereHas(
  _this,
  and_or,
  relationTable,
  selfColumn,
  relationColumn,
  fn = null
) {
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

function _where(_this, and_or, columnOrFn, condOrVal, val) {
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

function fDB(q) {
  let mode = process.env.NODE_ENV ?? "production"
  let config = conf.database[mode]
  return new Promise((resolve, reject) => {
    let con = mysql.createConnection(config)
    con.connect(function (err) {
      if (err) {
        reject(err)
      }
      con.query(q, function (err, result) {
        if (err) {
          reject(err)
        }
        resolve(result)
      })
      con.end()
    })
  })
}

class DBClass {
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

  limit(n) {
    if (n !== undefined) {
      this._limit = n
    }
    return this
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

  when(condition, fn) {
    if (
      arguments.length > 1 &&
      Boolean(condition) &&
      typeof fn === "function"
    ) {
      fn(this)
    }
    return this
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
        "(" +
        columns.map((c) => _col(c)).join(", ") +
        ") VALUES " +
        all_values.join(", ")
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
        "(" + columns.join(", ") + ") VALUES (" + values.join(", ") + ")"
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

  createTable(arr) {
    if (!arr || !Array.isArray(arr)) {
      return null
    }
    arr.forEach((arrItem, i) => {
      if (arrItem && typeof arrItem === "object" && "__s" in arrItem) {
        arr[i] = arrItem.__s(this._tableName, "createTable")
      }
    })
    this._r_table = "CREATE TABLE" + " IF NOT EXISTS"
    this._table_r = "("
    this._table_r += arr.join(", ")
    this._table_r += ")"
    return this._queryBuilder()
  }

  deleteTable() {
    this._r_table = "DROP TABLE" + " IF EXISTS"
    return this._queryBuilder()
  }

  deleteColumn(columnName) {
    this._r_table = "ALTER TABLE"
    this._table_r = "DROP COLUMN " + _col(columnName)
    return this._queryBuilder()
  }

  addColumns(arr) {
    if (!arr || !Array.isArray(arr)) {
      return null
    }
    arr.forEach((arrItem, i) => {
      if (arrItem && typeof arrItem === "object" && "__s" in arrItem) {
        arr[i] = arrItem.__s(this._tableName, "addColumns")
      }
    })
    this._r_table = "ALTER TABLE"
    this._table_r = "ADD ("
    this._table_r += arr.join(", ")
    this._table_r += ")"
    return this._queryBuilder()
  }

  changeColumn(obj) {
    if (arguments.length < 1) {
      return null
    }
    if (obj && typeof obj === "object" && "__s" in obj) {
      obj = obj.__s(this._tableName, "changeColumn")
    }
    this._r_table = "ALTER TABLE"
    this._table_r = "MODIFY COLUMN "
    this._table_r += obj
    return this._queryBuilder()
  }

  static column(_column) {
    let q_str = "",
      q_arr = []
    let q_obj = { notNull: "NOT NULL" }
    let secondary = {
      raw: function (rawValue) {
        q_obj.raw = rawValue
        return secondary
      },
      check: function (condition, value) {
        q_obj.check = "CHECK (" + _col(_column) + condition + value + ")"
        return secondary
      },
      from: function (startingValue) {
        // q_str += " ";
        return secondary
      },
      charset: function (ch) {
        // q_str += " ";
        return secondary
      },
      collation: function (coll) {
        // q_str += " ";
        return secondary
      },
      after: function (col) {
        // q_str += " ";
        return secondary
      },
      change: function () {
        // q_str += " ";
        return secondary
      },
      unsigned: function () {
        q_obj.unsigned = "UNSIGNED"
        return secondary
      },
      primary: function () {
        q_obj.primary = "PRIMARY KEY (" + _col(_column) + ")"
        return secondary
      },
      foreign: function (referenceTable, referencePrimaryKey) {
        q_obj.foreign = [referenceTable, referencePrimaryKey]
        return secondary
      },
      dropForeign: function (referenceTable) {
        q_obj.dropForeign = referenceTable
        return secondary
      },
      unique: function () {
        q_obj.unique = "UNIQUE"
        return secondary
      },
      nullable: function () {
        delete q_obj.notNull
        return secondary
      },
      default: function (def) {
        q_obj.default = "DEFAULT " + _val(def)
        return secondary
      },
      autoIncrement: function (def) {
        q_obj.autoIncrement = "AUTO_INCREMENT"
        return secondary
      },
      __s: function (tableName = "", fromMethod = "") {
        //_col(_column) + ' ' + "BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, PRIMARY KEY (" + _column + ")";
        if (q_obj.raw) {
          return _col(_column) + " " + q_obj.raw
        }
        if (q_obj.dataType) {
          q_arr.push(_col(_column))
          if (q_obj.arguments) {
            q_arr.push(q_obj.dataType + q_obj.arguments)
          } else {
            q_arr.push(q_obj.dataType)
          }
        }
        let keySequence = ["unsigned", "notNull", "autoIncrement", "default"]
        keySequence.forEach((key) => {
          if (q_obj[key]) {
            q_arr.push(q_obj[key])
          }
        })
        if (q_obj.primary) {
          q_arr.push(", " + q_obj.primary)
        }
        if (q_obj.foreign) {
          let prefix = fromMethod === "changeColumn" ? "ADD " : ""
          let [referenceTable, referencePrimaryKey] = q_obj.foreign
          q_arr.push(
            ", " +
              prefix +
              "CONSTRAINT " +
              _col("FK_" + tableName + "__" + referenceTable) +
              " FOREIGN KEY (" +
              _col(_column) +
              ") REFERENCES " +
              _col(referenceTable) +
              "(" +
              _col(referencePrimaryKey) +
              ")"
          )
        }
        if (q_obj.dropForeign) {
          q_arr.push(
            ", DROP FOREIGN KEY " +
              _col("FK_" + tableName + "__" + q_obj.dropForeign)
          )
        }
        if (q_obj.check) {
          q_arr.push(", " + q_obj.check)
        }
        return q_arr.join(" ")
      },
    }
    function f() {
      return secondary
    }
    let primary = {
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
    for (let key in primary) {
      primary[key] = function () {
        q_obj.dataType = key.toUpperCase()
        if (arguments.length > 0) {
          q_obj.arguments = "(" + [...arguments].join(", ") + ")"
        }
        return secondary
      }
    }
    primary.id = function () {
      return (
        _col(_column) +
        " " +
        "BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, PRIMARY KEY (" +
        _column +
        ")"
      )
    }
    return primary
  }

  _queryBuilder() {
    return fDB(this._all_q())
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

function DB(table) {
  return new DBClass(table)
}

Object.getOwnPropertyNames(DBClass)
  // .filter(prop => typeof DBClass[prop] === "function")
  .forEach((staticMethod) => {
    DB[staticMethod] = DBClass[staticMethod]
  })

// console.log(Object.getOwnPropertyNames(DBClass));
// exports.fDB=fDB;
module.exports = { fDB, DB }
