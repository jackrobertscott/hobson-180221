const express = require('express');
const HTTPStatus = require('http-status');
const mongoose = require('mongoose');
const { formatResponse, createError } = require('./utils/helpers');
const { authPopulate, tokenPopulate } = require('./utils/auth');
const TokenResource = require('./token.resource');

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
      const error = createError({
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
    throw new Error('Parameter "app" must be an express app instance.');
  }
  if (!resources || !Array.isArray(resources)) {
    throw new Error('Parameter "resources" must be an array of resources.');
  }
  if (typeof secret !== 'string') {
    throw new Error('Parameter "secret" must be a random string used to authenticate requests.');
  }
  parseRequest(app, parse);
  const tokenResource = resources.find(resource => resource.token) || new TokenResource({
    name: token,
    schema: new mongoose.Schema({}),
  });
  app.use(tokenPopulate({
    Model: tokenResource.model,
    secret,
  }));
  const userResource = resources.find(resource => resource.auth);
  if (userResource) {
    app.use(authPopulate({
      Model: userResource.model,
      secret,
    }));
    userResource.addExtensions({
      Token: tokenResource.model,
      secret,
    });
  }
  resources.forEach(resource => resource.attach(app));
  app.get('/', (req, res) => res.status(HTTPStatus.OK).send({
    environment: process.env.NODE_ENV,
  }));
  catchErrors(app, debug);
}
module.exports = connect;
