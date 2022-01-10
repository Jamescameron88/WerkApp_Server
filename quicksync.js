const db = require("./models/index");

db.sequelize
    .sync({ force: true })
    // .sync()
    .then((result) => {
    console.log(result);
})
.catch((err) => {
    console.log(err);
});