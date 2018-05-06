const { Types } = require('mongoose');
const HTTPStatus = require('http-status');
const errors = require('../errors');

/**
 * Check an parameter is a string or throw an error.
 */
module.exports.expect = function expect({ name, value, type = 'string', optional = false } = {}) {
  if (optional && typeof value === 'undefined') {
    return;
  }
  if (typeof name !== 'string') {
    throw new errors.BreakingResponse({ message: `Expected value "name" to be of type string but got ${typeof name}.` });
  }
  if (typeof value !== type) {
    throw new errors.BreakingResponse({ message: `Expected value "${name}" to be of type ${type} but got ${typeof value}.` });
  }
};

/**
 * Check if the id of an item is a valid.
 */
module.exports.checkObjectId = function checkObjectId(id) {
  if (!id || !Types.ObjectId.isValid(id)) {
    throw new errors.BreakingResponse({ message: `Expected value "id" to be a valid ObjectId but got ${id}.` });
  }
};

/**
 * Format response.
 */
module.exports.formatResponse = function formatResponse(meta = {}, debug = false) {
  if (meta instanceof Error) {
    const { status, code, data, message, stack } = meta;
    const error = {
      status: status || HTTPStatus.INTERNAL_SERVER_ERROR,
      code: code || 'error',
      message: message || `Error has occurred with status ${status || 'unknown'}.`,
    };
    if (debug && stack) {
      error.stack = stack;
    }
    if (data) {
      error.data = data;
    }
    return error;
  }
  const { status, code, data } = meta;
  return {
    status: status || data ? HTTPStatus.OK : HTTPStatus.NO_CONTENT,
    code: code || 'success',
    data,
  };
};

/**
 * Format middleware to match express infrastructure.
 */
module.exports.middlify = function middlify(middleware, resources, finish = false) {
  const { formatResponse } = module.exports;
  const exec = async (...args) => middleware(...args);
  return (req, res, next) => {
    const options = {
      req,
      res,
      next,
      body: req.body || {},
      params: req.params || {},
      query: req.query || {},
      user: req.user,
      auth: req.auth,
      ...resources,
    };
    exec(options)
      .then((data) => {
        if (finish) {
          const response = formatResponse({ data });
          res.status(response.status || HTTPStatus.INTERNAL_SERVER_ERROR)
            .json(response);
        } else {
          next();
        }
      })
      .catch(next);
  };
};

/**
 * Format hooks and execute work.
 */
module.exports.hookify = function hookify(key, handler, befores, afters) {
  return async (options) => {
    const tasksBefore = befores.map(hook => hook(options));
    await Promise.all(tasksBefore);
    let data;
    try {
      data = await handler(options);
    } catch (e) {
      if (e && e.name === 'ValidationError') {
        throw new errors.BadResponse({
          message: e._message || 'Request validation failed.',
          data: e.errors,
        });
      }
      if (e && e.name === 'MongoError') {
        throw new errors.BadResponse({
          message: e.message || 'Error occurred when working with database.',
          data: e.errors,
        });
      }
      throw e || new errors.BreakingResponse({ message: 'Error occurred on the server.' });
    }
    Object.assign(options, { data });
    const tasksAfter = afters.map(hook => hook(options));
    await Promise.all(tasksAfter);
    return data;
  };
};

/**
 * Check permissions.
 */
module.exports.permissionify = function permissionify(key, permissions, defaultOpen) {
  return async (...args) => {
    const checks = permissions.map(check => check(...args));
    const status = await Promise.all(checks);
    if ((!defaultOpen && !status.length) || status.length !== status.filter(outcome => Boolean(outcome)).length) {
      throw new errors.UnauthResponse({ message: 'Permission denied to route.' });
    }
  };
};

/**
 * Order express routes correctly so they execute correctly
 */
module.exports.orderRoutes = function orderRoutes(a, b) {
  const aSegments = a[1].path.split('/').filter(segment => segment.length);
  const bSegments = b[1].path.split('/').filter(segment => segment.length);
  if (aSegments.length && aSegments.length === bSegments.length) {
    let index = 0;
    while (index < aSegments.length) {
      if (aSegments[index].charAt(0) === ':' && bSegments[index].charAt(0) !== ':') {
        return 1;
      }
      if (bSegments[index].charAt(0) === ':' && aSegments[index].charAt(0) !== ':') {
        return -1;
      }
      index += 1;
    }
  }
  return bSegments.length - aSegments.length;
};

/**
 * Email validation regex.
 */
module.exports.emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
