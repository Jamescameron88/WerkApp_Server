'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('JobShifts', {
      ShiftId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER      },
      // Users_UserId: {
      //   type: Sequelize.INTEGER
      // },
      // Jobs_JobId: {
      //   type: Sequelize.INTEGER
      // },
      SchedulerJobId: {
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
      Company: {
        type: Sequelize.STRING
      },
      Location: {
        type: Sequelize.STRING
      },
      Pay: {
        type: Sequelize.STRING
      },
      NumberOfWerkers: {
        type: Sequelize.STRING
      },
      ShiftNotes: {
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('JobShifts');
  }
};