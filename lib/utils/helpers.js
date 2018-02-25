'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _require = require('mongoose'),
    Types = _require.Types;

var HTTPStatus = require('http-status');

var ObjectId = Types.ObjectId;

/**
 * Check an parameter is a string or throw an error.
 */

function checkString(chars) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      method = _ref.method,
      message = _ref.message;

  if (typeof chars !== 'string') {
    throw new Error(message || 'String parameter must be given to the ' + (method || 'unknown') + ' method.');
  }
}
module.exports.checkString = checkString;

/**
 * Check that the resource is compiled before proceeding.
 */
function checkCompile(compile) {
  if (compile) {
    throw new Error('Resource can not be change once it has been compiled.');
  }
}
module.exports.checkCompile = checkCompile;

/**
 * Check if the id of an item is a valid.
 */
function checkObjectId(id) {
  var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      message = _ref2.message;

  if (!id || !ObjectId.isValid(id)) {
    var error = new Error(message || 'Request did not contain a valid id.');
    error.code = HTTPStatus.BAD_REQUEST;
    throw error;
  }
}
module.exports.checkObjectId = checkObjectId;

/**
 * Check that an item exists.
 */
function checkExists(value) {
  var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      message = _ref3.message;

  if (!value) {
    var error = new Error(message || 'No items were found for the given request.');
    error.code = HTTPStatus.NOT_FOUND;
    throw error;
  }
}
module.exports.checkExists = checkExists;

/**
 * Format response.
 */
function formatResponse(data) {
  if (data instanceof Error) {
    var error = {
      status: data.status || 'error',
      code: data.code || HTTPStatus.INTERNAL_SERVER_ERROR,
      message: data.message || 'There was an error on the server.'
    };
    if (data.data) {
      error.data = data.data;
    }
    return error;
  }
  return {
    status: 'success',
    code: 200,
    data: data
  };
}
module.exports.formatResponse = formatResponse;

/**
 * Format middleware to match express infrastructure.
 */
function middlify(middleware, resources) {
  var _this = this;

  var end = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  return function (req, res, next) {
    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt('return', middleware(_extends({
                req: req,
                res: res,
                next: next,
                params: req.params,
                body: req.body,
                query: req.query
              }, resources)));

            case 1:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }))().then(function (data) {
      return end ? res.status(200).json(formatResponse(data)) : next();
    }).catch(function (error) {
      return res.status(error.code || 500).json(formatResponse(error));
    });
  };
}
module.exports.middlify = middlify;

/**
 * Format hooks and execute work.
 */
function hookify(key, handler, preHooks, postHooks) {
  var _this2 = this;

  return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var tasks, data, error, _tasks;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!preHooks.has(key)) {
              _context2.next = 4;
              break;
            }

            tasks = preHooks.get(key).map(function (hook) {
              return hook.apply(undefined, _toConsumableArray(args));
            });
            _context2.next = 4;
            return Promise.all(tasks);

          case 4:
            data = void 0;
            _context2.prev = 5;
            _context2.next = 8;
            return handler.apply(undefined, _toConsumableArray(args));

          case 8:
            data = _context2.sent;
            _context2.next = 20;
            break;

          case 11:
            _context2.prev = 11;
            _context2.t0 = _context2['catch'](5);

            if (!(_context2.t0 && _context2.t0.name === 'ValidationError')) {
              _context2.next = 19;
              break;
            }

            error = new Error(_context2.t0._message || 'Request validation failed');

            error.code = HTTPStatus.BAD_REQUEST;
            error.data = _context2.t0.errors;
            error.status = 'fail';
            throw error;

          case 19:
            throw _context2.t0;

          case 20:
            if (!postHooks.has(key)) {
              _context2.next = 24;
              break;
            }

            _tasks = postHooks.get(key).map(function (hook) {
              return hook.apply(undefined, [_extends({}, args[0], { data: data })].concat(_toConsumableArray(args.slice(1))));
            });
            _context2.next = 24;
            return Promise.all(_tasks);

          case 24:
            return _context2.abrupt('return', data);

          case 25:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, _this2, [[5, 11]]);
  }));
}
module.exports.hookify = hookify;

/**
 * Check permissions.
 */
function permissionify(key, permissions) {
  var _this3 = this;

  return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var checks, status, error;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            checks = [];

            if (permissions.has(key)) {
              checks = permissions.get(key).map(function (check) {
                return check.apply(undefined, _toConsumableArray(args));
              });
            }
            _context3.next = 4;
            return Promise.all(checks);

          case 4:
            status = _context3.sent;

            if (status.find(function (outcome) {
              return !!outcome;
            })) {
              _context3.next = 9;
              break;
            }

            error = new Error('Permission denied to access route.');

            error.code = HTTPStatus.UNAUTHORIZED;
            throw error;

          case 9:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, _this3);
  }));
}
module.exports.permissionify = permissionify;

/**
 * Order express routes correctly so they execute correctly
 */
function orderRoutes(a, b) {
  var aSegments = a[1].path.split('/').filter(function (segment) {
    return segment.length;
  });
  var bSegments = b[1].path.split('/').filter(function (segment) {
    return segment.length;
  });
  if (aSegments.length && aSegments.length === bSegments.length) {
    var index = 0;
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