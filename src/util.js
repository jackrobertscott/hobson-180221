const { Types } = require('mongoose');
const HTTPStatus = require('http-status');

const { ObjectId } = Types;

/**
 * Check an parameter is a string or throw an error.
 */
module.exports.checkString = function checkString(chars, { method, message } = {}) {
  if (typeof chars !== 'string') {
    throw new Error(message || `String parameter must be given to the ${method || 'unknown'} method.`);
  }
};

/**
 * Check an parameter is a string or throw an error.
 */
module.exports.checkConnection = function checkConnection(connection) {
  if (connection) {
    throw new Error('Resource can not be changed once it is attached to the app.');
  }
};

/**
 * Check if the id of an item is a valid.
 */
module.exports.checkObjectId = function checkObjectId(id, { message } = {}) {
  if (!id || !ObjectId.isValid(id)) {
    const error = new Error(message || 'Request did not contain a valid id.');
    error.code = HTTPStatus.BAD_REQUEST;
    throw error;
  }
};

/**
 * Check that an item exists.
 */
module.exports.checkExists = function checkExists(value, { message } = {}) {
  if (!value) {
    const error = new Error(message || 'No items were found for the given request.');
    error.code = HTTPStatus.NOT_FOUND;
    throw error;
  }
};

/**
 * Format response.
 */
module.exports.formatResponse = function formatResponse(data) {
  if (data instanceof Error) {
    return {
      status: 'error',
      code: data.code || 500,
      error: data.message || 'There was an error on the server.',
    };
  }
  return {
    status: 'success',
    code: 200,
    data,
  };
};

/**
 * Format middleware to match express infrastructure.
 */
module.exports.middlify = function middlify(middleware, resources, end = false) {
  return (req, res, next) => (async () => middleware({ req, res, next, ...resources }))()
    .then(data => end && res.status(200).json(module.exports.formatResponse(data)))
    .catch(error => res.status(error.code || 500).json(module.exports.formatResponse(error)));
};
