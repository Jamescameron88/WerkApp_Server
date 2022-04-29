'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BusinessAssociate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  BusinessAssociate.init({
    BusinessAssociateId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    // a_Users_UserId: DataTypes.INTEGER,
    // b_Users_UserId: DataTypes.INTEGER,
    RequestStatus: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'BusinessAssociate',
  });
  return BusinessAssociate;
};