'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "people", deps: []
 *
 **/

var info = {
    "revision": 1,
    "name": "initial_migration",
    "created": "2020-09-03T20:15:57.813Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "createTable",
    params: [
        "people",
        {
            "UserId": {
                "type": Sequelize.INTEGER,
                "field": "UserId",
                "primaryKey": true,
                "autoIncrement": true,
                "allowNull": false
            },
            "FirstName": {
                "type": Sequelize.STRING,
                "field": "FirstName"
            },
            "LastName": {
                "type": Sequelize.STRING,
                "field": "LastName"
            },
            "Email": {
                "type": Sequelize.STRING,
                "field": "Email",
                "unique": true
            },
            "Username": {
                "type": Sequelize.STRING,
                "field": "Username"
            },
            "Password": {
                "type": Sequelize.STRING,
                "field": "Password"
            },
            "isScheduler": {
                "type": Sequelize.BOOLEAN,
                "field": "isScheduler"
            },
            "isDeleted": {
                "type": Sequelize.BOOLEAN,
                "field": "isDeleted"
            },
            "company": {
                "type": Sequelize.STRING,
                "field": "company"
            },
            "occupation": {
                "type": Sequelize.STRING,
                "field": "occupation"
            },
            "associates": {
                "type": Sequelize.STRING,
                "field": "associates"
            },
            "createdAt": {
                "type": Sequelize.DATE,
                "field": "createdAt"
            },
            "updatedAt": {
                "type": Sequelize.DATE,
                "field": "updatedAt"
            }
        },
        {}
    ]
}];

module.exports = {
    pos: 0,
    up: function(queryInterface, Sequelize)
    {
        var index = this.pos;
        return new Promise(function(resolve, reject) {
            function next() {
                if (index < migrationCommands.length)
                {
                    let command = migrationCommands[index];
                    console.log("[#"+index+"] execute: " + command.fn);
                    index++;
                    queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
                }
                else
                    resolve();
            }
            next();
        });
    },
    info: info
};
