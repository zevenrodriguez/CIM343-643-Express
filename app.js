var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var hbs = require('hbs');//added

var app = express();

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Setting up your routes
//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');
//var parametersRouter = require('./routes/parameters');

//app.use('/', indexRouter);
//app.use('/users', usersRouter);
//app.use('/parameters',parametersRouter);

//Registering Partials
hbs.registerPartials(path.join(__dirname, 'views', 'partials'))
hbs.registerPartial('partial_name', 'partial value');

// Register an equality helper so templates can do: {{#if (eq v1 v2)}}
hbs.registerHelper('eq', function (a, b) {
  return a === b;
});

/* GET home page. */
app.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET page2 */
app.get('/page2', function(req, res, next) {
  res.render('page2', { title: 'Page2' });
});

/* GET home page. */
app.get('/parameters/:name', function(req, res) {
  //res.render('page2', { title: 'Page2' });
  // access the route parameter named `name` via `req.params.name`
 // res.send('user ' + req.params.name);
res.render('index', { title: req.params.name });
});

app.get('/form', function(req, res) {
  res.render('form', { title: 'The Form' });
});

// app.post('/form', function(req, res) {
//   // access the posted form data via `req.body`
//   //res.send('Form submitted! Name: ' + req.body.name);
//   res.render('submittedindy', { title: 'Form Submitted', name: req.body.name, last: req.body.last });
// });

app.post('/form', function(req, res) {
  // access the posted form data via `req.body`
  //res.send('Form submitted! Name: ' + req.body.name);
  console.log(req.body);
  var formdata = req.body;
  // pass only the form data; templates can compare with the `eq` helper
  res.render('submittedall', { title: 'Form Submitted', data: formdata });
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



module.exports = app;
