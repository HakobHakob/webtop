"use strict"
const bcrypt = require("bcrypt")
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
    }

    getFullName() {
      return [this.first_name, this.last_name].join(" ")
    }
  }
  User.init(
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      email: DataTypes.STRING,
      password: {
        type: DataTypes.STRING,
        set(value) {
          this.setDataValue("password", bcrypt.hashSync(value, 8))
        },
        get(){
          return null
        }
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      role: DataTypes.STRING,
      emailVerifyedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
    }
  )

  return User
}
