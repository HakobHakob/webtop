"use strict"
const bcrypt = require("bcrypt")
const { Model } = require("sequelize")

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The models/index file will call this method automatically.
     */
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
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      password: {
        type: DataTypes.STRING,
        set(value) {
          this.setDataValue("password", bcrypt.hashSync(value, 8))
        },
        get() {
          // const rawValue = this.getDataValue('username');
          // return rawValue ? rawValue.toUpperCase() : null;
          return null
        },
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      // timestamps: true,
      // createdAt: "created_at",
      // updatedAt: "updated_at",
      // created_at: 'createTimestamp',
      // updated_at: 'updateTimestamp',
    }
  )
  return User
}
