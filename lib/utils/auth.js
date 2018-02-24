'use strict';

/**
 * Authenticate a user.
 */
var authenticate = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref2) {
    var req = _ref2.req,
        model = _ref2.model;

    var error, _decodeToken, id, user, _error;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(!req.headers || !req.headers.authorization)) {
              _context.next = 4;
              break;
            }

            error = new Error('No authorisation token attached to request.');

            error.code = HTTPStatus.UNAUTHORIZED;
            throw error;

          case 4:
            _decodeToken = decodeToken(req.headers.authorization), id = _decodeToken.id;
            _context.next = 7;
            return model.findById(id);

          case 7:
            user = _context.sent;

            if (user) {
              _context.next = 12;
              break;
            }

            _error = new Error('No user was found for the given id.');

            _error.code = HTTPStatus.UNAUTHORIZED;
            throw _error;

          case 12:
            Object.assign(req, { user: user });

          case 13:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function authenticate(_x) {
    return _ref3.apply(this, arguments);
  };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var jwt = require('jsonwebtoken');
var HTTPStatus = require('http-status');

var secret = 'supersecretsecret';

/**
 * Generate an authentication token which can be sent to the client to
 * verify future requests.
 */
function generateToken(_ref) {
  var id = _ref.id,
      email = _ref.email,
      role = _ref.role;

  return jwt.sign({ id: id, email: email, role: role }, {
    expiresIn: '1m'
  });
}
module.exports.generateToken = generateToken;

/**
 * Decode a jwt token.
 */
function decodeToken(token) {
  return jwt.verify(token, secret);
}
module.exports.decodeToken = decodeToken;
module.exports.authenticate = authenticate;