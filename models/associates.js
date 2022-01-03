'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Associates extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Associates.init({
    a_UserID: DataTypes.INTEGER,
    a_AssociateID: DataTypes.INTEGER,
    RequestStatus: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Associates',
  });
  return Associates;
};