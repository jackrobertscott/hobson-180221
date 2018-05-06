const express = require('express');
const HTTPStatus = require('http-status');
const errors = require('./errors');
const { formatResponse, expect, depreciated } = require('./utils/helpers');
const { authPopulate, tokenPopulate } = require('./utils/auth');
const UserResource = require('./user/resource');

/**
 * Parse the body of the requests.
 */
function parseRequestBody(app) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
}

/**
 * Catch any requests or errors which aren't in the api.
 */
function handleErrors(app, debug) {
  return app
    .use((req, res, next) => {
      const error = new errors.NotFoundResponse({ message: 'Request address does not exist on the api.' });
      next(error);
    })
    .use((err, req, res, next) => {
      res.status(err.status || HTTPStatus.INTERNAL_SERVER_ERROR)
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
    res.status(response.status || HTTPStatus.INTERNAL_SERVER_ERROR)
      .json(response);
  });
}

/**
 * Attach multiple resources to a single app instance and provide authentication.
 *
 * @param {function} app the express app instance.
 * @param {array} resources an array of the hobson resources to attach to the app.
 * @param {string} secret a unique, random secret string used in authenticating users and tokens.
 * @param {boolean} status this will add a index route which returns the app environment.
 * @param {boolean} debug determines if the app should return stack traces in errors.
 * @param {function} before a function used to configure the app before attaching resources (not recommended to change).
 * @param {function} after a function used to configure the app after attaching resources.
 */
module.exports = function attach({
  app,
  resources,
  secret,
  status = true,
  debug = false,
  before,
  after,
  token,
}) {
  if (typeof app !== 'function' || typeof app.use !== 'function') {
    throw new errors.BreakingResponse({ message: 'Parameter "app" must be an express app instance.' });
  }
  if (!resources || !Array.isArray(resources)) {
    throw new errors.BreakingResponse({ message: 'Parameter "resources" must be an array of resources.' });
  }
  if (typeof secret !== 'string') {
    throw new errors.BreakingResponse({ message: 'Parameter "secret" must be a random string used to authenticate requests.' });
  }
  depreciated({ name: 'token', value: token });
  expect({ name: 'status', value: status, type: 'boolean' });
  expect({ name: 'debug', value: debug, type: 'boolean' });
  expect({ name: 'before', value: before, type: 'function', optional: true });
  expect({ name: 'after', value: after, type: 'function', optional: true });
  if (before) {
    before(app);
  } else {
    parseRequestBody(app);
  }
  app.use(tokenPopulate({ secret }));
  const userResource = resources.find(resource => resource instanceof UserResource);
  if (userResource) {
    app.use(authPopulate({ User: userResource.model, secret }));
    userResource.option({ secret });
  }
  resources.forEach(resource => resource.attach(app));
  if (status) {
    environmentCheck(app);
  }
  if (after) {
    after(app);
  }
  handleErrors(app, debug);
};
