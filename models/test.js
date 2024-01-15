"use strict"
const bcrypt = require("bcrypt")
const { Model } = require("sequelize")

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    getFullName() {
      // bcrypt.compareSync('qwerty', '$2b$08$anjueAN9I.ROPfygoSbF2uyqSvpFhwW/ZpIXXgqvG0fd4kTnGAMPa');
      return [this.first_name, this.last_name].join(" ")
    }
  }

  User.init(
    {
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email: DataTypes.STRING,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
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
      createdAt: "created_at",
      updatedAt: "updated_at",
      // created_at: 'createTimestamp',
      // updated_at: 'updateTimestamp',
    }
  )
  return User
}

/*Products test
"use strict"
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class Products extends Model {
    getName() {
      return this.name['en'] ?? this.name['hy'] ?? '';
    }
   
    static associate(models) {
      // define association here
    }
  }
  Products.init(
    {
      slug: DataTypes.STRING,
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Products",
      tableName: "products", // database name
      timestamps: false,
    }
  )
  return Products
}



*/
