require('dotenv').config();

const HTTPStatus = require('http-status');
const chalk = require('chalk');
const app = require('./app');
const exampleResource = require('./example/example.resource');
const userResource = require('./user/user.resource');

const environment = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send({ hello: 'world' }));
exampleResource.attach(app);
userResource.attach(app);
app.use((req, res, next) => {
  const status = HTTPStatus.NOT_FOUND;
  const err = new Error(HTTPStatus[status]);
  err.status = status;
  next(err);
});
app.use((err, req, res, next) => {
  res.status(err.status).json({
    status: 'error',
    message: err.message,
    data: {
      stack: environment === 'development' ? err.stack : {},
    },
  });
  next();
});

const { log } = console;
app.listen(port, () => log(`server started on port ${chalk.cyan(port)} (${chalk.magenta(environment)})`));
