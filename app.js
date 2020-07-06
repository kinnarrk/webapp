var createError = require('http-errors');
var express = require('express');
const passport = require('passport');
var path = require('path');
// var fs = require('fs');
// var cookieParser = require('cookie-parser');
var morgan = require('morgan');
const bodyParser = require("body-parser");
const flash = require('connect-flash');
const session = require('express-session');
var winston = require('./config/winston');

var env = process.env.NODE_ENV || 'development';

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user.routes');
var booksRouter = require('./routes/book.routes');
var catalogueRouter = require('./routes/catalogue.routes');
var cartRouter = require('./routes/cart.routes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
app.use(morgan('combined'));
// app.use(morgan('combined', { stream: winston.stream }));
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

// Passport Config
require('./config/passport')(passport);

//Express session
app.use(
    session({
        secret: 'sosecret',
        resave: false,
        saveUninitialized: false
    })
);

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
app.use('/books', booksRouter);
app.use('/catalogue', catalogueRouter);
app.use('/cart', cartRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // add this line to include winston logging
  winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const db = require("./models");
db.sequelize.sync();

module.exports = app;
// module.exports = env;
