"use strict"
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class Setting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Setting.init(
    {
      key: DataTypes.STRING,
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      value: DataTypes.STRING,
      type: DataTypes.STRING,
      image: DataTypes.STRING,
      images: DataTypes.STRING,
      active: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Setting",
      tableName: 'settings',
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  )
  return Setting
}
