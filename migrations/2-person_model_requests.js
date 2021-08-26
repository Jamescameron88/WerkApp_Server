'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "requests" to table "people"
 *
 **/

var info = {
    "revision": 2,
    "name": "person_model_requests",
    "created": "2021-08-17T23:54:23.566Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "people",
        "requests",
        {
            "type": Sequelize.STRING,
            "field": "requests"
        }
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
