"use strict"

const bcrypt = require("bcrypt")
const { User } = require("../models")

// Create an instance of the User model
const userInstance = User.build({
  firstName: "John",
  lastName: "Doe",
  email: "example@email.com",
  createdAt: new Date(),
  updatedAt: new Date(),
  password: bcrypt.hashSync("123456", 10),
})

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          firstName: userInstance.firstName,
          lastName: userInstance.lastName,
          email: userInstance.email,
          createdAt: userInstance.createdAt,
          updatedAt: userInstance.updatedAt,
          password: userInstance.password,
        },
      ],
      {}
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {})
  },
}
