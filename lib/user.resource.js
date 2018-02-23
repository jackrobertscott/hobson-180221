'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Resource = require('./resource');
var bcrypt = require('bcryptjs');

var UserResource = function (_Resource) {
  _inherits(UserResource, _Resource);

  function UserResource() {
    var _ref;

    _classCallCheck(this, UserResource);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = _possibleConstructorReturn(this, (_ref = UserResource.__proto__ || Object.getPrototypeOf(UserResource)).call.apply(_ref, [this].concat(args)));

    if (_typeof(_this.schema.obj.password) !== 'object') {
      throw new Error('User resource must contain a "password" field.');
    }
    _this.schema.pre('save', function preSave(next) {
      var _this2 = this;

      if (!this.isModified('password')) {
        next();
      } else {
        bcrypt.genSalt(5).then(function (salt) {
          return bcrypt.hash(_this2.password, salt);
        }).then(function (hash) {
          _this2.password = hash;
          next();
        }).catch(next);
      }
    });
    _this.schema.methods.comparePassword = function comparePassword(candidate) {
      return bcrypt.compare(candidate, this.password);
    };
    return _this;
  }

  _createClass(UserResource, [{
    key: 'defaults',
    get: function get() {
      var _this3 = this;

      return _get(UserResource.prototype.__proto__ || Object.getPrototypeOf(UserResource.prototype), 'defaults', this).set('login', {
        path: '/action/login',
        method: 'get',
        handler: function () {
          var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    return _context.abrupt('return', { login: false });

                  case 1:
                  case 'end':
                    return _context.stop();
                }
              }
            }, _callee, _this3);
          }));

          function handler() {
            return _ref2.apply(this, arguments);
          }

          return handler;
        }(),
        activate: []
      });
    }
  }]);

  return UserResource;
}(Resource);

module.exports = UserResource;