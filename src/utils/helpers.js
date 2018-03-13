const { Types } = require('mongoose');
const HTTPStatus = require('http-status');

/**
 * Check an parameter is a string or throw an error.
 */
function createError({ message, code = HTTPStatus.INTERNAL_SERVER_ERROR, data } = {}) {
  if (message && typeof message !== 'string') {
    throw new Error('Parameter "message" passed to createError() must be a string.');
  }
  if (code) {
    if (typeof code !== 'number') {
      throw new Error('Parameter "code" passed to createError() must be a number.');
    }
  }
  let status;
  if (code >= 500 && code < 600) {
    status = 'error';
  } else if (code >= 400 && code < 500) {
    status = 'fail';
  } else {
    throw new Error('Parameter "code" passed to createError() must be between 400 and 600.');
  }
  const error = new Error(message || 'Error has occurred on the server.');
  error.status = status;
  error.code = code;
  if (data) {
    error.data = data;
  }
  return error;
}
module.exports.createError = createError;

/**
 * Check an parameter is a string or throw an error.
 */
function checkString(chars, { method, message } = {}) {
  if (typeof chars !== 'string') {
    throw createError({
      message: message || `Parameter "${chars}" must be given to the ${method || 'unknown'} method.`,
    });
  }
}
module.exports.checkString = checkString;

/**
 * Check that the resource is compiled before proceeding.
 */
function checkCompile(compile) {
  if (compile) {
    throw createError({
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
    throw createError({
      message: 'Request did not contain a valid id.',
      code: HTTPStatus.BAD_REQUEST,
    });
  }
}
module.exports.checkObjectId = checkObjectId;

/**
 * Check that an item exists.
 */
function checkExists(value, { message } = {}) {
  if (!value) {
    throw createError({
      message: 'No items were found for the given request.',
      code: HTTPStatus.NOT_FOUND,
    });
  }
}
module.exports.checkExists = checkExists;

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
    data: data,
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
    params: req.params,
    body: req.body,
    query: req.query,
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
      if (e && e.name === 'ValidationError') {
        const error = new Error(e._message || 'Request validation failed');
        error.code = HTTPStatus.BAD_REQUEST;
        error.data = e.errors;
        error.status = 'fail';
        throw error;
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
function permissionify(key, permissions) {
  return async (...args) => {
    let checks = [];
    if (permissions.has(key)) {
      checks = permissions.get(key).map(check => check(...args));
    }
    const status = await Promise.all(checks);
    if (!status.find(outcome => !!outcome)) {
      const error = new Error('Permission denied to access route.');
      error.code = HTTPStatus.UNAUTHORIZED;
      error.status = 'fail';
      throw error;
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
