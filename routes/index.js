var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
const { BOOLEAN, INTEGER } = require('sequelize');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;


// npx sequelize-cli model:generate --name Person --attributes userId:INTEGER,firstName:string,lastName:string,email:string,password:string,isScheduler:BOOLEAN,company:string,occupation:string,associates:string