var createError = require('http-errors');
var express = require('express');
const passport = require('passport');
var path = require('path');
// var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require("body-parser");
const flash = require('connect-flash');
const session = require('express-session');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user.routes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// parse requests of content-type - application/json
app.use(bodyParser.json());

//Bodyparser
app.use(express.urlencoded({
  extended: true
}));

//Express session
app.use(
    session({
      secret: 'sosecret',
      resave: false,
      saveUninitialized: false
    })
);

// Passport Config
require('./config/passport')(passport);

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect flash
app.use(flash());

//Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user;
  next();
});

// // parse requests of content-type - application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/users', usersRouter);

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

const db = require("./models");
db.sequelize.sync();

module.exports = app;
