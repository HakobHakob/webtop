const Joi = require("joi")
const fs = require("node:fs")
const moment = require("moment/moment")
const { DB } = require("../../components/db")
const { api_validate, unique } = require("../../components/validate")
const settingsResources = require("../resources/settingsResourse")
const { handleFileUpload } = require("../../components/globalFunctions")

const createSettings = async (req, res, next) => {
  const locale = res.locals.api_local
  const uniqueErr = await unique("settings", "key", req.body.key)

  if (uniqueErr) {
    res.status(422)
    return res.send({ errors: { key: uniqueErr } })
  }
  const validation_error = api_validate("settingsSchema", req, res)
  if (validation_error) {
    res.status(422)
    return res.send({ errors: validation_error })
  }
  let message = null

  let settingFile = req.files ? req.files.file : null
  let fileName = null
  if (settingFile) {
    const filePath = "storage/uploads/settingsFiles/"
    fileName = await handleFileUpload(settingFile, filePath)
  }
  let newSettingsData = {}
  const { key, name, description, value, active } = req.body
  try {
    newSettingsData = {
      key,
      name,
      description: JSON.stringify({ [locale]: description }),
      value,
      file: fileName,
      created_at: moment().format("yyyy-MM-DD HH:mm:ss"),
      updated_at: moment().format("yyyy-MM-DD HH:mm:ss"),
    }
    if ("active" in req.body) {
      newSettingsData.active = active
    }
    const forId = await DB("settings").create(newSettingsData)
    newSettingsData.id = forId.insertId
  } catch (e) {
    console.error(e)
    res.status(422)
    return res.send({ errors: "Setting not created." })
  }
  let setting = await settingsResources(newSettingsData, locale)
  return res.send({ data: { settings: setting, message }, errors: {} })
}

const updateSettings = async (req, res, next) => {
  const errors = []
  const { setting_id } = req.params
  let setting = null
  const locale = res.locals.api_local
  let { key, name, description, value, active } = req.body
  const updatedSettingData = {}

  if (!setting_id) {
    res.status(422)
    return res.send({ errors: "No setting id parameter." })
  }
  const uniqueErr = await unique("settings", "key", req.body.key)
  if (uniqueErr) {
    res.status(422)
    return res.send({ errors: { key: uniqueErr } })
  }
  const validation_error = api_validate("settingUpdate", req, res)
  if (validation_error) {
    res.status(422)
    return res.send({ errors: validation_error })
  }
  try {
    setting = await DB("settings").find(setting_id)
    if (!setting) {
      res.status(422)
      return res.send({
        errors: "Setting with this id " + setting_id + " can not found.",
      })
    }
    if (key) {
      updatedSettingData.key = key
    }
    if (name) {
      updatedSettingData.name = name
    }
    if (description) {
      let oldDescription = setting.description
        ? JSON.parse(setting.description)
        : {}
      oldDescription[locale] = description
      updatedSettingData.description = JSON.stringify(oldDescription)
    }
    if (value) {
      updatedSettingData.value = value
    }
    if ("active" in req.body) {
      updatedSettingData.active = active
    }

    let settingFile = req.files ? req.files.file : null
    if (settingFile) {
      const filePath = "storage/uploads/settingsFiles/"
      updatedSettingData.file = await handleFileUpload(settingFile, filePath)
      if (setting.file) {
        fs.unlinkSync(__basedir + "/public/" + setting.file)
      }
    }

    if (Object.keys(updatedSettingData).length > 0) {
      updatedSettingData.updated_at = moment().format("yyyy-MM-DD HH:mm:ss")
      await DB("settings").where("id", setting_id).update(updatedSettingData)
    } else {
      return res.send({ message: "Nothing to update." })
    }
  } catch (e) {
    console.error(e)
    res.status(422)
    return res.send({ errors: "Setting not updated." })
  }
  for (let key in updatedSettingData) {
    setting[key] = updatedSettingData[key]
  }
  setting = await settingsResources(setting, locale)
  return res.send({
    data: { setting },
    message: "Setting data updated successfully.",
    errors: errors,
  })
}

const destroySetting = async (req, res, next) => {
  let { setting_id } = req.params
  if (!setting_id) {
    res.status(422)
    return res.send({ errors: "No setting id parameter." })
  }
  let setting = null
  try {
    setting = await DB("settings").find(setting_id)
    if (!setting) {
      res.status(422)
      return res.send({
        errors: "Setting with this id " + setting_id + " can not found.",
      })
    }
    if (setting.file) {
      try {
        fs.unlinkSync(__basedir + "/public/" + setting.file)
      } catch (e) {
        console.error(e)
        res.status(422)
        return res.send({ errors: "Setting file not deleted." })
      }
    }
    await DB("settings").where("id", setting_id).delete()
  } catch (e) {
    console.error(e)
    res.status(422)
    return res.send({ errors: "Setting not deleted." })
  }
  return res.send({
    message: "Setting with this id " + setting_id + " deleted successfully.",
  })
}

module.exports = {
  createSettings,
  updateSettings,
  destroySetting,
}
