require('dotenv').config();

const mongoose = require('mongoose');
const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const helmet = require('helmet');
const cors = require('cors');

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI);

module.exports = () => {
  const app = express();
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    app.use(logger('dev'));
  }
  app.use(cookieParser());
  app.use(compress());
  app.use(methodOverride());
  app.use(helmet());
  app.use(cors({ origin: '*' }));
  app.enable('trust proxy');
  return app;
};
