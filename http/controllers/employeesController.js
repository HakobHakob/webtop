const { DB } = require("../../components/db")
const bcrypt = require("bcrypt")
const moment = require("moment/moment")
const fs = require("node:fs")
const { api_validate, unique } = require("../../components/validate")
const { handleFileUpload } = require("../../components/globalFunctions")
const teamsResource = require("../resources/employeeResource")
const employeeResource = require("../resources/employeeResource")

const createEmployee = async (req, res, next) => {
  req.session.errors = req.session.errors || {}
  const locale = res.locals.api_local

  const uniqueErr = await unique("employees", "email", req.body.email)
  if (uniqueErr) {
    res.status(422)
    return res.send({ errors: { email: uniqueErr } })
  }

  const validation_error = api_validate("employeeRegistration", req, res)

  if (validation_error) {
    res.status(422)
    return res.send({ errors: validation_error })
  }
  const {
    firstName,
    lastName,
    rank,
    title,
    description,
    email,
    password,
    active,
  } = req.body

  const { image, images } = req.files ?? { image: null, images: null }
  const newEmployeeData = { first_name: firstName, last_name: lastName }

  if (rank) {
    newEmployeeData.rank = JSON.stringify({ [locale]: rank })
  }
  if (title) {
    newEmployeeData.title = JSON.stringify({ [locale]: title })
  }
  if (description) {
    newEmployeeData.description = JSON.stringify({ [locale]: description })
  }

  try {
    if (image && !Array.isArray(image)) {
      const employeeImgPath = "storage/uploads/employeeImage/"
      const employeeImage = await handleFileUpload(image, employeeImgPath)
      newEmployeeData.image = employeeImage
    }
    if (images && !Array.isArray(images)) {
      images = [images]
    }
    newEmployeeData.images = []
    const employeeImagesPath = "storage/uploads/employeeImages/"
    for (const img of images ?? []) {
      const uploadedImages = await handleFileUpload(img, employeeImagesPath)
      newEmployeeData.images.push(uploadedImages)
    }
    if (newEmployeeData.images.length < 1) {
      delete newEmployeeData.images
    } else {
      newEmployeeData.images = JSON.stringify(newEmployeeData.images)
    }

    newEmployeeData.email = email
    newEmployeeData.password = bcrypt.hashSync(password, 8)
    newEmployeeData.created_at = moment().format("yyyy-MM-DD HH:mm:ss")
    newEmployeeData.updated_at = moment().format("yyyy-MM-DD HH:mm:ss")
    if ("active" in req.body) {
      newEmployeeData.active = active
    }

    const forId = await DB("employees").create(newEmployeeData)
    newEmployeeData.id = forId.insertId
  } catch (error) {
    res.status(422)
    return res.send({ errors: error.message })
  }
  const employee = await teamsResource(newEmployeeData, locale)

  return res.send({
    employee: employee,
    message: "Employee created successfully.",
    errors: {},
  })
}

const updateEmployee = async (req, res, next) => {
  const { employee_id } = req.params
  let employee = null

  if (!employee_id) {
    res.status(422)
    return res.send({ errors: "There isn't employee id parameter." })
  }
  const validation_error = api_validate("employeeUpdate", req, res)
  if (validation_error) {
    res.status(422)
    return res.send({ errors: validation_error })
  }

  let { first_name, last_name, rank, title, description, active, stayImages } =
    req.body

  const updateEmployeeData = {}
  let locale = res.locals.api_local
  try {
    employee = await DB("employees").find(employee_id)
    if (!employee) {
      res.status(422)
      return res.send({
        errors: "Employee with this id " + employee_id + " couldn't found.",
      })
    }

    if (first_name) {
      updateEmployeeData.first_name = first_name
    }
    if (last_name) {
      updateEmployeeData.last_name = last_name
    }
    if (rank) {
      let oldRank = employee.rank ? JSON.parse(employee.rank) : {}
      oldRank[locale] = rank
      updateEmployeeData.rank = JSON.stringify(oldRank)
    }
    if (title) {
      let oldTitle = employee.title ? JSON.parse(employee.title) : {}
      oldTitle[locale] = title
      updateEmployeeData.title = JSON.stringify(oldTitle)
    }
    if (description) {
      let oldDescription = employee.description
        ? JSON.parse(employee.description)
        : {}
      oldDescription[locale] = description
      updateEmployeeData.description = JSON.stringify(oldDescription)
    }
    if ("active" in req.body) {
      updateEmployeeData.active = active
    }

    const employeeImage = req.files ? req.files.image : null
    if (employeeImage) {
      const imgPath = "storage/uploads/employeeImage/"
      updateEmployeeData.image = await handleFileUpload(employeeImage, imgPath)
      if (employee.image) {
        fs.unlinkSync(__basedir + "/public/" + employee.image)
      }
    }

    updateEmployeeData.images = []

    let oldImages = employee.images ? JSON.parse(employee.images) : []
    stayImages = stayImages ? JSON.parse(stayImages) : []

    for (const oldImage of oldImages) {
      if (stayImages.includes(oldImage)) {
        updateEmployeeData.images.push(oldImage)
      } else {
        try {
          fs.unlinkSync(__basedir + "/public/" + oldImage)
        } catch (error) {
          console.error(error)
          res.status(422)
          return res.send({
            errors: "Cannot delete the image file: " + oldImage + ".",
          })
        }
      }
    }

    const employeeImages = req.files ? req.files.images : null
    if (employeeImages && employeeImages.length > 0) {
      for (const imageItem of employeeImages) {
        const imgPath = "storage/uploads/employeeImages/"
        updateEmployeeData.images.push(
          await handleFileUpload(imageItem, imgPath)
        )
      }
    }
    updateEmployeeData.images = JSON.stringify(updateEmployeeData.images)
    if (Object.keys(updateEmployeeData).length > 0) {
      updateEmployeeData.updated_at = moment().format("yyyy-MM-DD HH:mm:ss")
      await DB("employees").where("id", employee_id).update(updateEmployeeData)
    } else {
      return res.send({ message: "Nothing to update." })
    }
  } catch (error) {
    console.error(error)
    res.status(422)
    return res.send({ errors: "Employee not updated." })
  }

  for (const key in updateEmployeeData) {
    employee[key] = updateEmployeeData[key]
  }

  employee = await employeeResource(employee, locale)
  return res.send({
    employee,
    message: "Employee data updated successfully.",
  })
}

const deleteEmployee = async (req, res, next) => {
  const { employee_id } = req.params
  if (!employee_id) {
    res.status(422)
    return res.send({ errors: "No employee id parameter." })
  }

  let employee = null
  try {
    employee = await DB("employees").find(employee_id)
    if (!employee) {
      res.status(422)
      return res.send({
        errors: "Employee with this id " + employee_id + " can not found.",
      })
    }
    let imagesToBeDelete = employee.images ? JSON.parse(employee.images) : []
    if (employee.image) {
      imagesToBeDelete.push(employee.image)
    }
    for (const imageToBeDelete of imagesToBeDelete) {
      try {
        fs.unlinkSync(__basedir + "/public/" + imageToBeDelete)
      } catch (e) {
        console.error(e)
        res.status(422)
        return res.send({ errors: "Images not deleted." })
      }
    }

    await DB("employees").where("id", employee_id).delete()
  } catch (e) {
    console.error(e)
    res.status(422)
    return res.send({ errors: "Employee not deleted." })
  }
  return res.send({
    message: "Employee with this id " + employee_id + " deleted successfully.",
  })
}

module.exports = {
  createEmployee,
  updateEmployee,
  deleteEmployee,
}
