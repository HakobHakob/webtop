const Joi = require("joi")

const validate = (schema, req, res) => {
  const schema_joi = Joi.object(schema)
  let newSchema = {}
  for (let key in schema) {
    newSchema[key] = req.body[key]
  }
  const joiErrors = schema_joi.validate(newSchema, { abortEarly: false }).error
  //console.log('validate errors=', joiErrors);
  if (joiErrors) {
    req.session.errors = {}
    joiErrors.details.forEach((err_item) => {
      req.session.errors[err_item.path[0]] = err_item.message
    })
    return false
    // let backURL = req.header('Referer') || '/';
    // return res.redirect(backURL);
  }
  return true
}

module.exports = { validate }
