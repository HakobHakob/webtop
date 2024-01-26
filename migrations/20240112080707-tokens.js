"use strict"
const { conf } = require("../config/app_config")

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(conf.token.table, {
      user_id: {
        // allowNull default is true
        allowNull: false,
        type: Sequelize.BIGINT,
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      token: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      refresh_token_date: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      created_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(conf.token.table)
  },
}
