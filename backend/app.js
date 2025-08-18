var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// const cors=require("cors") 
require("dotenv").config()
const mongoose=require("mongoose")

mongoose.connect(process.env.Mongo_DB)
.then( console.log("MongoDb Connected"))
.catch(err=> console.log(err)) 


var indexRouter = require('./routes/index');
const teachersroutes=require('./routes/teachersroutes');
const studentsroutes=require('./routes/studentsroutes');
const otp=require('./routes/otp');



var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use('/index', indexRouter);
app.use('/teacher',teachersroutes);
app.use('/student',studentsroutes);
app.use('/otp',otp);



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

module.exports = app;
