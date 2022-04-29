'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserShifts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserShifts.init({
    UserShiftId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    // ShiftId: DataTypes.INTEGER,
    // UserUserId: DataTypes.INTEGER,
    ShiftStatus: DataTypes.STRING,
    IsPaid: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'UserShifts',
  });
  return UserShifts;
};