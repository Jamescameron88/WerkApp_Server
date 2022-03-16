'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CrewMembers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CrewMembers.init({
    CrewMemberId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    // CrewName_CrewID: DataTypes.INTEGER,
    // Users_UserId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'CrewMembers',
  });
  return CrewMembers;
};