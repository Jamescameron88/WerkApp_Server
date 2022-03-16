'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CrewName extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CrewName.init({
    CrewId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    // Users_UserId_scheduler: DataTypes.INTEGER,
    CrewName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'CrewName',
  });
  return CrewName;
};