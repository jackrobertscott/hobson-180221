const express = require('express');
const HTTPStatus = require('http-status');
const { formatResponse } = require('./utils/helpers');
const errors = require('./errors');
const { authPopulate, tokenPopulate } = require('./utils/auth');
const model = require('./model');
const schema = require('./schema');

/**
 * Parse the body of the requests.
 */
function parseRequest(app, parse) {
  if (parse) {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
  }
}

/**
 * Catch any requests or errors which aren't in the api.
 */
function catchErrors(app, debug) {
  return app
    .use((req, res, next) => {
      const error = new errors.Response({
        message: 'Request address does not exist on the api.',
        code: HTTPStatus.NOT_FOUND,
      });
      next(error);
    })
    .use((err, req, res, next) => {
      res.status(err.code || HTTPStatus.INTERNAL_SERVER_ERROR)
        .json(formatResponse(err, debug));
      next();
    });
}

/**
 * Add a health check route.
 */
function environmentCheck(app) {
  const response = formatResponse({
    data: {
      environment: process.env.NODE_ENV,
    },
  });
  app.get('/', (req, res) => {
    res.status(response.code)
      .json(response);
  });
}

/**
 * Connect resources to the express app.
 *
 * @param {Object} options.app the express app instance
 * @param {Array} options.resources the express app instance
 */
function connect({
  app,
  resources,
  secret,
  parse = true,
  debug = false,
  token = 'Token',
}) {
  if (typeof app !== 'function' || typeof app.use !== 'function') {
    throw new errors.Response({ message: 'Parameter "app" must be an express app instance.' });
  }
  if (!resources || !Array.isArray(resources)) {
    throw new errors.Response({ message: 'Parameter "resources" must be an array of resources.' });
  }
  if (typeof secret !== 'string') {
    throw new errors.Response({ message: 'Parameter "secret" must be a random string used to authenticate requests.' });
  }
  parseRequest(app, parse);
  const Token = model({
    name: token,
    schema: schema({ type: 'token' }),
  });
  app.use(tokenPopulate({ Token, secret }));
  const userResource = resources.find(resource => resource.auth);
  if (userResource) {
    app.use(authPopulate({ User: userResource.model, secret }));
    userResource.addExtensions({ Token, secret });
  }
  resources.forEach(resource => resource.attach(app));
  environmentCheck(app);
  catchErrors(app, debug);
}
module.exports = connect;
