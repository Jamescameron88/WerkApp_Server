'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Shifts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Shifts.init({
    ShiftId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    // UserUserId: DataTypes.INTEGER,
    ShiftIdentifier: DataTypes.STRING,
    POCName: DataTypes.STRING,
    POCPhone: DataTypes.STRING,
    Pay: DataTypes.STRING,
    DateDay: DataTypes.DATE,
    StartDateTime: DataTypes.DATE,
    FinishDateTime: DataTypes.DATE,
    ShiftNotes: DataTypes.STRING,
    Company: DataTypes.STRING,
    Location: DataTypes.STRING,
    SchedulerApproval: DataTypes.BOOLEAN,
    NumberOfWerkers: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Shifts',
  });
  return Shifts;
};