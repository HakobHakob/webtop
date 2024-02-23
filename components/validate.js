const Joi = require("joi")
const { DB } = require("./db")

const userRegistrationSchema = () => {
  return {
    firstName: Joi.string().min(2).max(30).required(),
    lastName: Joi.string().min(2).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).required(),
    role: Joi.string().min(2).max(30),
    emailVerifyedAt: new Date(),
  }
}

const employeeRegistrationSchema = () => {
  return {
    firstName: Joi.string().min(2).max(30).required(),
    lastName: Joi.string().min(2).max(30).required(),
    rank: Joi.string().min(2).max(512),
    title: Joi.string().min(2).max(512),
    description: Joi.string().min(2).max(512),
  }
}

const loginSchema = () => {
  return {
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(20).required(),
  }
}

const userUpdateSchema = () => {
  return {
    email: Joi.string().email(),
    first_name: Joi.string().min(2).max(30),
    last_name: Joi.string().min(2).max(30),
    role: Joi.string().min(2).max(30),
    old_password: Joi.string().min(6).max(30),
    new_password: Joi.string().min(6).max(30),
  }
}

const employeeUpdateSchema = () => {
  return {
    first_name: Joi.string().min(2).max(30),
    last_name: Joi.string().min(2).max(30),
    rank: Joi.string().min(2).max(512),
    title: Joi.string().min(2).max(512),
    description: Joi.string().min(2).max(512),
  }
}

const settingsSchema = () => {
  return {
    key: Joi.string().required(),
    name: Joi.string().min(1).max(512),
    description: Joi.string().min(1),
    value: Joi.string().min(1),
  }
}

const settingUpdateSchema = () => {
  return {
    key: Joi.string(),
    name: Joi.string().min(1).max(512),
    description: Joi.string().min(1),
    value: Joi.string().min(1),
  }
}

const schemasObject = {
  userRegistration: userRegistrationSchema(),
  employeeRegistration: employeeRegistrationSchema(),
  login: loginSchema(),
  userUpdate: userUpdateSchema(),
  employeeUpdate: employeeUpdateSchema(),
  settingsSchema: settingsSchema(),
  settingUpdate: settingUpdateSchema(),
}

const api_validate = (schemaName, req, res) => {
  const valid_err = {}
  const schema = schemasObject[schemaName]
  const schema_joi = Joi.object(schema)
  let newSchema = {}
  for (let key in schema) {
    newSchema[key] = req.body[key]
  }
  const joiErrors = schema_joi.validate(newSchema, { abortEarly: false }).error

  if (joiErrors) {
    joiErrors.details.forEach((err_item) => {
      valid_err[err_item.path[0]] = err_item.message
    })
    return valid_err
  }
  return null
}

const unique = async (table, columnName, columnValue) => {
  columnValue = columnValue || columnValue === null ? columnValue : ""
  let exists = true
  try {
    exists = await DB(table).where(columnName, columnValue).exists()
  } catch (e) {
    console.error(e)
  }
  if (exists) {
    return "The " + columnName + " is already in use"
  }
  return null
}

class ValidateClass {
  constructor(req, fn) {
    this._req = req
    this._body = req.body
    this._files = req.files
    let answ = fn(this)
    return answ
  }
  number() {
    return this
  }
  integer() {}
  string() {}
  required() {}
}

module.exports = {
  api_validate,
  unique,
  ValidateClass,
}
