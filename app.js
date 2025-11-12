var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var hbs = require('hbs');//added

var app = express();

const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');

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

const storage = path.join(__dirname, '..', 'data', 'database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: false
});


const Task = sequelize.define('Task', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT }
});

// Define Poll model (kept inline for simplicity)
const Poll = sequelize.define('Poll', {
  color: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
});

// Ensure database tables exist
sequelize.sync().then(() => {
  console.log('Database synced');
}).catch(err => {
  console.error('Unable to sync database:', err);
});

// Register an equality helper so templates can do: {{#if (eq v1 v2)}}
hbs.registerHelper('eq', function (a, b) {
  return a === b;
});

/* GET home page. */
app.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET page2 */
app.get('/page2', function (req, res, next) {
  res.render('page2', { title: 'Page2' });
});

/* GET home page. */
app.get('/parameters/:name', function (req, res) {
  //res.render('page2', { title: 'Page2' });
  // access the route parameter named `name` via `req.params.name`
  // res.send('user ' + req.params.name);
  res.render('index', { title: req.params.name });
});

app.get('/form', function (req, res) {
  res.render('form', { title: 'The Form' });
});

app.get('/addtask', function (req, res) {
  res.render('addtask', { title: 'The Form' });
});

/* POST create task */
app.post('/addtask', async function (req, res, next) {
  try {
    const created = await Task.create({ name: req.body.name, description: req.body.description });
    // render a clearer confirmation page for the saved task
    res.render('task_submitted', { title: 'Task Saved', task: created });
  } catch (err) {
    next(err);
  }
});



/* GET tasks list (JSON) */
app.get('/tasks', async function (req, res, next) {
  try {
    const tasks = await Task.findAll({ order: [['createdAt', 'DESC']] });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

/* GET tasks page (HTML) */
app.get('/taskspage', async function (req, res, next) {
  try {
    const tasks = await Task.findAll({ order: [['createdAt', 'DESC']] });
    // render an HTML page with the tasks
    res.render('taskspage', { title: 'Tasks', tasks });
  } catch (err) {
    next(err);
  }
});

/* POST delete a task */
app.post('/tasks/:id/delete', async function (req, res, next) {
  try {
    const id = req.params.id;
    await Task.destroy({ where: { id } });
    // redirect back to the tasks page
    res.redirect('/taskspage');
  } catch (err) {
    next(err);
  }
});


/* GET single-chart route */
app.get('/chart', async function (req, res, next) {
  //res.render('charts', { title: 'Chart' });
  try {
    const poll = await Poll.findAll({ order: [['createdAt', 'DESC']] });


    // render an HTML page with the tasks
    res.render('charts', { title: 'Chart', poll, pollJSON: JSON.stringify(poll) });
  } catch (err) {
    next(err);
  }
});

/* POST chart form handler: increment existing color entry or create it, then redirect to /chart */
app.post('/chart', async function (req, res, next) {
  try {
    const color = req.body.color;
    if (!color) return res.redirect('/chart');
    // Find existing entry for this color
    const existing = await Poll.findOne({ where: { color } });
    if (existing) {
      // increment and save
      //existing.amount = (existing.amount || 0) + 1;
      if (existing.amount) {
        // If 'existing.amount' exists and is not 0 (it's "truthy")
        existing.amount = existing.amount + 1;
      } else {
        // If 'existing.amount' is missing (undefined) or 0 (it's "falsy")
        existing.amount = 1;
      }
      await existing.save();
    } else {
      // create new entry with amount 1
      await Poll.create({ color, amount: 1 });
    }
    // redirect back to the chart page
    res.redirect('/chart');
  } catch (err) {
    next(err);
  }
});

app.get('/p5', function (req, res) {
  res.render('p5js', { title: 'The Form' });
});

app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
