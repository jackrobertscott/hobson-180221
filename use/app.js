require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const helmet = require('helmet');
const cors = require('cors');
const HTTPStatus = require('http-status');
const mongoose = require('mongoose');
const exampleResource = require('./example/example.resource');

const environment = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 3000;

/**
 * Configure mongoose database wrapper
 */
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI);

const app = express();
if (environment === 'development') {
  app.use(logger('dev'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compress());
app.use(methodOverride());
app.use(helmet());
app.use(cors({ origin: '*' }));
app.enable('trust proxy');

app.get('/', (req, res) => res.send({ hello: 'world' }));

exampleResource.attach(app);

// catch 404
app.use((req, res, next) => {
  const status = HTTPStatus.NOT_FOUND;
  const err = new Error(HTTPStatus[status]);
  err.status = status;
  next(err);
});

// error handler, send stacktrace only during development
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

app.listen(port, () => console.log(`server started on port ${port} (${environment})`));
