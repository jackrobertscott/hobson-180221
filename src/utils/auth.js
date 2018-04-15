const jwt = require('jsonwebtoken');
const HTTPStatus = require('http-status');
const errors = require('../errors');

/**
 * Generate an authentication token which can be sent to the client to
 * verify future requests.
 */
module.exports.generateToken = function generateToken(payload, secret, options = {}) {
  const data = Object.assign({
    expiresIn: '30d',
  }, options);
  return {
    ...data,
    token: jwt.sign(payload, secret, data),
  };
};

/**
 * Decode a jwt token.
 */
module.exports.decodeToken = function decodeToken(token, secret) {
  return jwt.verify(token, secret);
};

/**
 * Package the authentication.
 */
module.exports.authPackage = function authPackage(payload, secret, options) {
  const { generateToken, decodeToken } = module.exports;
  const { token } = generateToken(payload, secret, options);
  const { iat, exp } = decodeToken(token, secret);
  return {
    token,
    payload,
    expires: exp,
    iat,
  };
};

/**
 * Populate a token found on the request.
 */
module.exports.tokenPopulate = function tokenPopulate({ Token, secret }) {
  const { decodeToken } = module.exports;
  return (req, res, next) => {
    if (!req.headers || !req.headers.authorization) {
      next();
      return;
    }
    const token = req.headers.authorization;
    const auth = decodeToken(token, secret);
    Token.findById(auth.id)
      .then((issue) => {
        if (issue.active) {
          Object.assign(req, { auth: issue });
        } else {
          throw new errors.Response({
            message: 'Token is not active. Please reauthenticate.',
            code: HTTPStatus.UNAUTHORIZED,
          });
        }
        next();
      })
      .catch(next);
  };
};

/**
 * Populate authentication on request if auth found.
 */
module.exports.authPopulate = function authPopulate({ User }) {
  return (req, res, next) => {
    if (!req.auth) {
      next();
      return;
    }
    if (req.auth && User) {
      User.findById(req.auth.payload.userId)
        .then((user) => {
          req.user = user;
          next();
        })
        .catch(next);
    } else {
      next();
    }
  };
};

/**
 * Create and save a token with a user.
 */
module.exports.createUserToken = async function createUserToken({ Token, user, secret, options } = {}) {
  const { authPackage } = module.exports;
  const item = new Token({});
  const pack = authPackage({
    id: item.id,
    userId: user.id,
    email: user.email,
  }, secret, options);
  return Object.assign(item, pack).save();
};
