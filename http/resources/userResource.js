const userResource = (userModel) => {
  return {
    first_name: userModel.firstName,
    last_name: userModel.lastName,
    email: userModel.email,
  }
}

module.exports = userResource
