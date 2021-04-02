"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class person extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  person.init(
    {
      UserId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      FirstName: DataTypes.STRING,
      LastName: DataTypes.STRING,
      Email: {
        type: DataTypes.STRING,
        unique: true,
      },
      Username: DataTypes.STRING,
      Password: DataTypes.STRING,
      isScheduler: DataTypes.BOOLEAN,
      isDeleted: DataTypes.BOOLEAN,
      company: DataTypes.STRING,
      occupation: DataTypes.STRING,
      associates: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {
      sequelize,
      modelName: "person",
    }
  );
  return person;
};
