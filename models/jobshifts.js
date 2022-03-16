'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class JobShifts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  JobShifts.init({
    ShiftId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    // Users_UserId: DataTypes.INTEGER,
    // Jobs_JobId: DataTypes.INTEGER,
    SchedulerJobId: DataTypes.STRING,
    DateDay: DataTypes.DATE,
    StartDateTime: DataTypes.DATE,
    FinishDateTime: DataTypes.DATE,
    Company: DataTypes.STRING,
    Location: DataTypes.STRING,
    Pay: DataTypes.STRING,
    NumberOfWerkers: DataTypes.STRING,
    ShiftNotes: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'JobShifts',
  });
  return JobShifts;
};