'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _require = require('change-case'),
    camelCase = _require.camelCase;

var _require2 = require('pluralize'),
    plural = _require2.plural,
    singular = _require2.singular;

var _require3 = require('./util'),
    checkString = _require3.checkString,
    checkObjectId = _require3.checkObjectId,
    checkExists = _require3.checkExists;

/**
 * Find many items in the database.
 *
 * @param {string} name the resource name
 */


function find(name) {
  var _this = this;

  checkString(name, { method: camelCase('find' + name) });
  return function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref) {
      var filter = _ref.query.filter,
          model = _ref.model;
      var value;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return model.find(filter || {});

            case 2:
              value = _context.sent;

              checkExists(value);
              return _context.abrupt('return', _defineProperty({}, plural(name), value));

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }));

    return function (_x) {
      return _ref2.apply(this, arguments);
    };
  }();
}
module.exports.find = find;

/**
 * Find one item in the database by it's id.
 *
 * @param {string} name the resource name
 */
function findOne(name) {
  var _this2 = this;

  checkString(name, { method: camelCase('findOne' + name) });
  return function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(_ref4) {
      var params = _ref4.params,
          model = _ref4.model;
      var id, value;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              id = params[name + 'Id'];

              checkObjectId(id);
              _context2.next = 4;
              return model.findById(id);

            case 4:
              value = _context2.sent;

              checkExists(value, { message: 'Model ' + name + ' did not have an item with the id "' + id + '".' });
              return _context2.abrupt('return', _defineProperty({}, singular(name), value));

            case 7:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this2);
    }));

    return function (_x2) {
      return _ref5.apply(this, arguments);
    };
  }();
}
module.exports.findOne = findOne;

/**
 * Create a resource item in the database.
 *
 * @param {string} name the resource name
 */
function create(name) {
  var _this3 = this;

  checkString(name, { method: camelCase('create' + name) });
  return function () {
    var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(_ref7) {
      var body = _ref7.body,
          model = _ref7.model;
      var value;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return model.create(body);

            case 2:
              value = _context3.sent;

              checkExists(value, { message: 'There was an error creating an item for ' + name + '.' });
              return _context3.abrupt('return', _defineProperty({}, singular(name), value));

            case 5:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, _this3);
    }));

    return function (_x3) {
      return _ref8.apply(this, arguments);
    };
  }();
}
module.exports.create = create;

/**
 * Update a resource item in the database.
 *
 * @param {string} name the resource name
 */
function update(name) {
  var _this4 = this;

  checkString(name, { method: camelCase('update' + name) });
  return function () {
    var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(_ref10) {
      var params = _ref10.params,
          body = _ref10.body,
          model = _ref10.model;
      var id, value;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              id = params[name + 'Id'];

              checkObjectId(id);
              _context4.next = 4;
              return model.findById(id);

            case 4:
              value = _context4.sent;

              checkExists(value, { message: 'Model ' + name + ' did not have an item with the id "' + id + '".' });
              _context4.next = 8;
              return Object.assign(value, body).save();

            case 8:
              return _context4.abrupt('return', _defineProperty({}, singular(name), value));

            case 9:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, _this4);
    }));

    return function (_x4) {
      return _ref11.apply(this, arguments);
    };
  }();
}
module.exports.update = update;

/**
 * Remove a resource from the database.
 *
 * @param {string} name the resource name
 */
function remove(name) {
  var _this5 = this;

  checkString(name, { method: camelCase('remove' + name) });
  return function () {
    var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(_ref13) {
      var params = _ref13.params,
          model = _ref13.model;
      var id;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              id = params[name + 'Id'];

              checkObjectId(id);
              _context5.next = 4;
              return model.findByIdAndRemove(id);

            case 4:
              return _context5.abrupt('return', _defineProperty({}, singular(name), null));

            case 5:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, _this5);
    }));

    return function (_x5) {
      return _ref14.apply(this, arguments);
    };
  }();
}
module.exports.remove = remove;