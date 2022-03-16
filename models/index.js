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
db.crewname = require("./crewname")(sequelize, Sequelize);
db.crewmembers = require("./crewmembers")(sequelize, Sequelize);
db.job = require("./job")(sequelize, Sequelize);
db.jobshifts = require("./jobshifts")(sequelize, Sequelize);
db.availablejobs = require("./availablejobs")(sequelize, Sequelize);


// ============ DB Relationships ============

//  Users to BusinessAssociate
db.businessassociate.belongsTo(db.user, {
  foreignKey: "a_Users_UserId"
});
db.businessassociate.belongsTo(db.user, {
  foreignKey: "b_Users_UserId"
});

//  Users to CrewName
db.user.hasMany(db.crewname);
db.crewname.belongsTo(db.user);

//  Users to CrewMembers
db.user.hasMany(db.crewmembers);
db.crewmembers.belongsTo(db.user);

//  CrewName to CrewMembers
db.crewname.hasMany(db.crewmembers);
db.crewmembers.belongsTo(db.crewname);

//  Users to Jobs
db.user.hasMany(db.job);
db.job.belongsTo(db.user);

//  Users to AvailableJobs
db.user.hasMany(db.availablejobs);
db.availablejobs.belongsTo(db.user);

//  Users to JobShifts
db.user.hasMany(db.jobshifts);
db.jobshifts.belongsTo(db.user, {
  foreignKey: "Scheduler_Users_UserId"
});
db.jobshifts.belongsTo(db.user, {
  foreignKey: "Werker_Users_UserId"
});

//  Jobs to AvailableJobs
// db.job.hasMany(db.availablejobs);
// db.availablejobs.belongsTo(db.job);

// //  Jobs to JobShifts
// db.job.hasMany(db.jobshifts);
// db.jobshifts.belongsTo(db.job);

// ============ End of DB Relationships ============




module.exports = db;
