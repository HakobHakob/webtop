"use strict"

module.exports = (sequelize, DataTypes) => {
  const Products = sequelize.define(
    "Products",
    {
      slug: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Products",
      tableName: "products", // database name
      timestamps: false,
    }
  )

  // Define instance method
  Products.prototype.getName = (object) => {
    for (const key in object) {
      if (Object.hasOwnProperty.call(object, key)) {
        const element = object[key]
        return element
      }
    }

    return "Not found"
  }

  return Products
}
