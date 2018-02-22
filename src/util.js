const { Types } = require('mongoose');

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
 * Check if the id of an item is a valid.
 */
module.exports.checkObjectId = function checkObjectId(id, { message } = {}) {
  if (!id || !ObjectId.isValid(id)) {
    throw new Error(message || 'Request did not contain a valid id.');
  }
};

/**
 * Check that an item exists.
 */
module.exports.checkExists = function checkExists(value, { message } = {}) {
  if (!value) {
    throw new Error(message || 'No items were found for the given request.');
  }
};

/**
 * Format middleware to match express infrastructure.
 */
module.exports.middlify = function middlify(middleware, options) {
  return (req, res, next) => (async () => middleware({ req, res, next, ...options }))()
    .catch(e => res.send({ error: e.message }));
};
