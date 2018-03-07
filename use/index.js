require('dotenv').config();

const chalk = require('chalk');
const app = require('./app')();
const { connect } = require('../lib/index');
const exampleResource = require('./example/example.resource');
const userResource = require('./user/user.resource');

const environment = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 3000;

connect({
  app,
  resources: [
    exampleResource,
    userResource,
  ],
  parse: false,
});

const { log } = console;
app.listen(port, () => log(`server started on port ${chalk.cyan(port)} (${chalk.magenta(environment)})`));
