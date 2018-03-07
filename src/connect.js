const express = require('express');
const HTTPStatus = require('http-status');
const { formatResponse } = require('./utils/helpers');

/**
 * Connect resources to the express app.
 *
 * @param {Object} options.app the express app instance
 * @param {Array} options.resources the express app instance
 */
function connect({
  app,
  resources,
  parse = true,
  debug = false,
}) {
  if (typeof app !== 'function' || typeof app.use !== 'function') {
    throw new Error('Parameter "app" must be an express app instance.');
  }
  if (!resources || !Array.isArray(resources)) {
    throw new Error('Parameter "resources" must be an array of resources.');
  }
  if (parse) {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
  }
  resources.forEach(resource => resource.attach(app));
  app.get('/', (req, res) => res.send({
    environment: process.env.NODE_ENV,
  }));
  app.use((req, res, next) => {
    const code = HTTPStatus.NOT_FOUND;
    const err = new Error(HTTPStatus[code]);
    err.code = code;
    next(err);
  });
  app.use((err, req, res, next) => {
    res.status(err.code || HTTPStatus.INTERNAL_SERVER_ERROR).json(formatResponse(err, debug));
    next();
  });
}

module.exports = connect;
