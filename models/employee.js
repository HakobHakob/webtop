"use strict"
const bcrypt = require("bcrypt")
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    static associate(models) {
      // define association here
    }
    getFullName() {
      return [this.firstName, this.lastName].join(" ")
    }
  }
  Employee.init(
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      image: DataTypes.STRING,
      images: DataTypes.JSON,
      rank: DataTypes.STRING,
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      active: DataTypes.BOOLEAN,
      email: DataTypes.STRING,
      emailVerifyedAt: DataTypes.DATE,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Employee",
      tableName: "employees",
    }
  )
  return Employee
}
