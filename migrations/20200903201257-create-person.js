'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('people', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      UserId: {
        type: Sequelize.INTEGER
      },
      FirstName: {
        type: Sequelize.STRING
      },
      LastName: {
        type: Sequelize.STRING
      },
      Email: {
        type: Sequelize.STRING
      },
      Username: {
        type: Sequelize.STRING
      },
      Password: {
        type: Sequelize.STRING
      },
      isScheduler: {
        type: Sequelize.BOOLEAN
      },
      isDeleted: {
        type: Sequelize.BOOLEAN
      },
      company: {
        type: Sequelize.STRING
      },
      occupation: {
        type: Sequelize.STRING
      },
      associates: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('people');
  }
};