'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Shifts', {
      ShiftId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER      },
      // Users_UserId: {
      //   type: Sequelize.INTEGER
      // },
      ShiftIdentifier: {
        type: Sequelize.STRING
      },
      POCName: {
        type: Sequelize.STRING
      },
      POCPhone: {
        type: Sequelize.STRING
      },
      Pay: {
        type: Sequelize.STRING
      },
      DateDay: {
        type: Sequelize.DATE
      },
      StartDateTime: {
        type: Sequelize.DATE
      },
      FinishDateTime: {
        type: Sequelize.DATE
      },
      ShiftNotes: {
        type: Sequelize.STRING
      },
      Company: {
        type: Sequelize.STRING
      },
      Location: {
        type: Sequelize.STRING
      },
      SchedulerApproval: {
        type: Sequelize.BOOLEAN
      },
      NumberOfWerkers: {
        type: Sequelize.INTEGER
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Shifts');
  }
};