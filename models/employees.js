"use strict"
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class Employees extends Model {}
  Employees.init(
    {
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      description: DataTypes.STRING,
      photo: DataTypes.STRING,
      speciality: DataTypes.STRING,
      pagination: DataTypes.INTEGER,
      page: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Employees",
      tableName: "Employees",
      timestamps: true,
      underscored: true,
    }
  )
  return Employees
}
