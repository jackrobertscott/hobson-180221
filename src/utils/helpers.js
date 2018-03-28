const { Types } = require('mongoose');
const HTTPStatus = require('http-status');
const { ResponseError } = require('./errors');

/**
 * Check an parameter is a string or throw an error.
 */
function checkString(check, { method, message } = {}) {
  if (typeof check !== 'string') {
    throw new ResponseError({
      message: message || `Parameter of type string is missing on the ${method || 'unknown'} method.`,
    });
  }
}
module.exports.checkString = checkString;

/**
 * Check that the resource is compiled before proceeding.
 */
function checkCompile(compile) {
  if (compile) {
    throw new ResponseError({
      message: 'Resource can not be change once it has been compiled.',
    });
  }
}
module.exports.checkCompile = checkCompile;

/**
 * Check if the id of an item is a valid.
 */
function checkObjectId(id) {
  if (!id || !Types.ObjectId.isValid(id)) {
    throw new ResponseError({
      message: 'Request did not contain a valid id.',
      code: HTTPStatus.BAD_REQUEST,
    });
  }
}
module.exports.checkObjectId = checkObjectId;

/**
 * Format response.
 */
function formatResponse(response = {}, debug = false) {
  if (response instanceof Error) {
    const { status, code, data, message, stack } = response;
    const error = {
      status: status || 'error',
      code: code || HTTPStatus.INTERNAL_SERVER_ERROR,
      message: message || 'There was an error on the server.',
    };
    if (debug && stack) {
      error.stack = stack;
    }
    if (data) {
      error.data = data;
    }
    return error;
  }
  const { status, code, data } = response;
  return {
    status: status || 'success',
    code: code || HTTPStatus.OK,
    data,
  };
}
module.exports.formatResponse = formatResponse;

/**
 * Format middleware to match express infrastructure.
 */
function middlify(middleware, resources, end = false) {
  return (req, res, next) => (async () => middleware({
    req,
    res,
    next,
    body: req.body || {},
    params: req.params || {},
    query: req.query || {},
    user: req.user,
    auth: req.auth,
    ...resources,
  }))()
    .then(data => end ? res.status(200).json(formatResponse({ data })) : next())
    .catch(error => res.status(error.code || HTTPStatus.INTERNAL_SERVER_ERROR).json(formatResponse(error)));
}
module.exports.middlify = middlify;

/**
 * Format hooks and execute work.
 */
function hookify(key, handler, preHooks, postHooks) {
  return async (...args) => {
    if (preHooks.has(key)) {
      const tasks = preHooks.get(key).map(hook => hook(...args));
      await Promise.all(tasks);
    }
    let data;
    try {
      data = await handler(...args);
    } catch (e) {
      if (!e) {
        throw new ResponseError({
          message: 'Error occurred on the server.',
          code: HTTPStatus.INTERNAL_SERVER_ERROR,
        });
      }
      if (e.name === 'ValidationError') {
        throw new ResponseError({
          message: e._message || 'Request validation failed.',
          code: HTTPStatus.BAD_REQUEST,
          data: e.errors,
        });
      }
      if (e.name === 'MongoError') {
        throw new ResponseError({
          message: e.message || 'Error occurred when working with database.',
          code: HTTPStatus.BAD_REQUEST,
          data: e.errors,
        });
      }
      throw e;
    }
    if (postHooks.has(key)) {
      const tasks = postHooks.get(key).map(hook => hook({ ...args[0], data }, ...args.slice(1)));
      await Promise.all(tasks);
    }
    return data;
  };
}
module.exports.hookify = hookify;

/**
 * Check permissions.
 */
function permissionify(key, permissions, defaultOpen) {
  return async (...args) => {
    let checks = [];
    if (permissions.has(key)) {
      checks = permissions.get(key).map(check => check(...args));
    }
    const status = await Promise.all(checks);
    if ((!defaultOpen && !status.length) || status.length !== status.filter(outcome => Boolean(outcome)).length) {
      throw new ResponseError({
        message: 'Permission denied to access route.',
        code: HTTPStatus.UNAUTHORIZED,
      });
    }
  };
}
module.exports.permissionify = permissionify;

/**
 * Order express routes correctly so they execute correctly
 */
function orderRoutes(a, b) {
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
}
module.exports.orderRoutes = orderRoutes;
