'use strict'

module.exports = {
    async up (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn(
                'UserActionTakens',
                'MultiKey',
                Sequelize.STRING
            ),
        ]);
    },

    async down (queryInterface, Sequelize) {

    }
};