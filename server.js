var mysql = require('mysql2');

var connection = mysql.createConnection({
    host:'werkapp-server-v1.czp4jlccvdhe.us-east-1.rds.amazonaws.com',
    port: '3306',
    user: 'admin',
    password: 'grace_Born00',
    database: 'werk'
})

connection.connect(err=>{
    if (err) throw err;
    console.log('Connected to DB');
})

var sql = "Select * from AvailableShifts";
connection.query(sql, function (err, result) {
    console.log(result);
})