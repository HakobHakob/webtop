"use strict"
const bcrypt = require("bcrypt")
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
   
    static associate(models) {
      // define association here
    }

    getFullName() {
      // bcrypt.compareSync('qwerty', '$2b$08$anjueAN9I.ROPfygoSbF2uyqSvpFhwW/ZpIXXgqvG0fd4kTnGAMPa');
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
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
    }
  )

  return User
}
