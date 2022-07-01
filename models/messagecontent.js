'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MessageContent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MessageContent.init({
    Message: DataTypes.STRING,
    UserNotificationTableId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'MessageContent',
  });
  return MessageContent;
};