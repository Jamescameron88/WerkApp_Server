var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');

// This makes the routes (A)
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user');
var associatesRouter = require('./routes/businessassociate');
var crewRouter = require('./routes/crewandmembers');
var shiftRouter = require('./routes/shifts');

var app = express();

app.use(bodyParser.json());
app.use(cors({
  credentials: true,
  origin: true,
  exposedHeaders: ["set-cookie"],
  optionsSuccessStatus: 200
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// This makes the routes (B)
app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/businessassociate', associatesRouter);
app.use('/crewandmembers', crewRouter);
app.use('/shifts', shiftRouter);

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// models.sequelize.sync().then(function () {
//   console.log("DB Sync'd up")
// });

module.exports = app;
