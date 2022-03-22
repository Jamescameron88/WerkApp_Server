'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AvailableShifts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AvailableShifts.init({
    AvailableShiftId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    // UsersUserId: DataTypes.INTEGER,
    // ShiftId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'AvailableShifts',
  });
  return AvailableShifts;
};