const userResource = (userModel) => {
  return {
    first_name: userModel.dataValues.firstName,
    last_name: userModel.dataValues.lastName,
    email: userModel.dataValues.email,
  }
}

module.exports = userResource
