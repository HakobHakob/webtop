"use strict"
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class Media extends Model {
    static associate(models) {
      // define association here
    }
  }
  Media.init(
    {
      user_id: DataTypes.INTEGER,
      path: DataTypes.STRING,
      name: DataTypes.STRING,
      uuid: DataTypes.STRING,
      mime_type: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Media",
      tableName: "media",
      createdAt: "created_at",
      updatedAt: "updated_at",
      timestamps: true,
      underscored: true,
    }
  )
  return Media
}
