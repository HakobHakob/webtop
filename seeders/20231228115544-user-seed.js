"use strict"

const bcrypt = require("bcrypt")
const { User } = require("../models")

// Create an instance of the User model
const userInstance = User.build({
  firstName: "John",
  lastName: "Doe",
  email: "example@email.com",
  created_at: new Date(),
  updated_at: new Date(),
  password: bcrypt.hashSync("123456", 10),
})

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          firstName: userInstance.firstName,
          lastName: userInstance.lastName,
          email: userInstance.email,
          created_at: userInstance.created_at,
          updated_at: userInstance.updated_at,
          password: userInstance.password,
        },
      ],
      {}
    )
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("Users", null, {})
  },
}
