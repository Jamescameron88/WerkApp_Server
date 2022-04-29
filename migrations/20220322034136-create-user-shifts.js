'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserShifts', {
      UserShiftId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ShiftStatus: {
        type: Sequelize.STRING
      },
      IsPaid: {
        type: Sequelize.BOOLEAN
      },
      // ShiftId: {
      //   type: Sequelize.INTEGER
      // },
      // UsersUserId: {
      //   type: Sequelize.INTEGER
      // },
      ShiftCancelled: {
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('UserShifts');
  }
};