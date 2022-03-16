'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AvailableJobs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AvailableJobs.init({
    AvailableJobId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    }
    // Users_UserId: DataTypes.INTEGER,
    // Jobs_JobId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'AvailableJobs',
  });
  return AvailableJobs;
};