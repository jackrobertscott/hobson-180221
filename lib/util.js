'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _require = require('mongoose'),
    Types = _require.Types;

var HTTPStatus = require('http-status');

var ObjectId = Types.ObjectId;

/**
 * Check an parameter is a string or throw an error.
 */

module.exports.checkString = function checkString(chars) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      method = _ref.method,
      message = _ref.message;

  if (typeof chars !== 'string') {
    throw new Error(message || 'String parameter must be given to the ' + (method || 'unknown') + ' method.');
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
module.exports.checkObjectId = function checkObjectId(id) {
  var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      message = _ref2.message;

  if (!id || !ObjectId.isValid(id)) {
    var error = new Error(message || 'Request did not contain a valid id.');
    error.code = HTTPStatus.BAD_REQUEST;
    throw error;
  }
};

/**
 * Check that an item exists.
 */
module.exports.checkExists = function checkExists(value) {
  var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      message = _ref3.message;

  if (!value) {
    var error = new Error(message || 'No items were found for the given request.');
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
      error: data.message || 'There was an error on the server.'
    };
  }
  return {
    status: 'success',
    code: 200,
    data: data
  };
};

/**
 * Format middleware to match express infrastructure.
 */
module.exports.middlify = function middlify(middleware, resources) {
  var _this = this;

  var end = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  return function (req, res, next) {
    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt('return', middleware(_extends({ req: req, res: res, next: next }, resources)));

            case 1:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }))().then(function (data) {
      return end && res.status(200).json(module.exports.formatResponse(data));
    }).catch(function (error) {
      return res.status(error.code || 500).json(module.exports.formatResponse(error));
    });
  };
};