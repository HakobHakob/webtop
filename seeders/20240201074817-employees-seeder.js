"use strict"

const { Employees } = require("../models")

const employeesInstance = Employees.build({
  firstName: "John",
  lastName: "Doe",
  description: "Front-end Developer",
  photo: null,
  speciality: "React.js",
  pagination: 1,
  page: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
})

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Employees",
      [
        {
          first_name: "John",
          last_name: "Doe",
          description: employeesInstance.description,
          photo: employeesInstance.photo,
          speciality: employeesInstance.speciality,
          pagination: employeesInstance.pagination,
          page: employeesInstance.page,
          createdAt: employeesInstance.createdAt,
          updatedAt: employeesInstance.updatedAt,
        },
      ],
      {}
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Employees", null, {})
  },
}
