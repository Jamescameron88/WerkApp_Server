'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Mirror the /models file names
db.user = require("./user")(sequelize, Sequelize);
db.businessassociate = require("./businessassociate")(sequelize,Sequelize);
db.shifts = require("./shifts")(sequelize, Sequelize);
db.availableshifts = require("./availableshifts")(sequelize, Sequelize);
db.usershifts = require("./usershifts")(sequelize, Sequelize);
db.useractiongroup = require("./useractiongroup")(sequelize, Sequelize);
db.useractiontaken = require("./useractiontaken")(sequelize, Sequelize);
db.useractiontype = require("./useractiontype")(sequelize, Sequelize);
db.usernotificationtable = require("./usernotificationtable")(sequelize, Sequelize);
db.messagecontent = require("./messagecontent")(sequelize, Sequelize);


// ============ DB Relationships ============

//  Users to BusinessAssociate
db.businessassociate.belongsTo(db.user, {
  foreignKey: "a_Users_UserId"
});
db.businessassociate.belongsTo(db.user, {
  foreignKey: "b_Users_UserId"
});

//  Users to Shifts
db.user.hasMany(db.shifts);
db.shifts.belongsTo(db.user);

//  Users to AvailableShifts
db.user.hasMany(db.availableshifts);
db.availableshifts.belongsTo(db.user);

//  Shifts to AvailableShifts
db.shifts.hasMany(db.availableshifts);
db.availableshifts.belongsTo(db.shifts);

//  Shifts to UserShifts
db.shifts.hasMany(db.usershifts);
db.usershifts.belongsTo(db.shifts);

//  Users to UserShifts
db.user.hasMany(db.usershifts);
db.usershifts.belongsTo(db.user);

//  UserActionGroup to UserActionType
db.useractiongroup.hasMany(db.useractiontype);
db.useractiontype.belongsTo(db.useractiongroup);

//  UserActionType to UserActionTaken
db.useractiontype.hasMany(db.useractiontaken);
db.useractiontaken.belongsTo(db.useractiontype);

//  UserActionTaken to UserNotificationTable
db.useractiontaken.hasMany(db.usernotificationtable);
db.usernotificationtable.belongsTo(db.useractiontaken);

//  UserNotificationTable to MessageContent
db.messagecontent.belongsTo(db.usernotificationtable);

//  UserActionTaken to User
db.user.hasMany(db.useractiontaken);
db.useractiontaken.belongsTo(db.user);  

//  UserNotificationTable to User
db.user.hasMany(db.usernotificationtable);
db.usernotificationtable.belongsTo(db.user);




//  Users to CrewName
// db.user.hasMany(db.crewname);
// db.crewname.belongsTo(db.user);

//  Users to CrewMembers
// db.user.hasMany(db.crewmembers);
// db.crewmembers.belongsTo(db.user);

//  CrewName to CrewMembers
// db.crewname.hasMany(db.crewmembers);
// db.crewmembers.belongsTo(db.crewname);

// ============ End of DB Relationships ============




module.exports = db;
