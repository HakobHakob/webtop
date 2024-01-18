const Joi = require("joi")

const validate = (req, res) => {
  const schema = {
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(20).required(),
  }
  const schema_joi = Joi.object(schema)
  let newSchema = {}
  for (let key in schema) {
    newSchema[key] = req.body[key]
  }

  const joiErrors = schema_joi.validate(newSchema, { abortEarly: false }).error

  if (joiErrors) {
    joiErrors.details.forEach((err_item) => {
      req.session.errors[err_item.path[0]] = err_item.message
    })
    return false
  }
  return true
}

const api_validate = (req, res) => {
  const schema = {
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(20).required(),
  }
  const valid_err = {}
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

module.exports = { validate, api_validate }
