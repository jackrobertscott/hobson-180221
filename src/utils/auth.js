const jwt = require('jsonwebtoken');
const { singular } = require('pluralize');
const Token = require('../token/model');

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
module.exports.tokenPopulate = function tokenPopulate({ secret }) {
  const { decodeToken } = module.exports;
  return (req, res, next) => {
    if (!req.headers || !req.headers.authorization) {
      next();
      return;
    }
    const token = req.headers.authorization;
    if (token === 'null' || token === 'undefined') {
      next();
      return;
    }
    const auth = decodeToken(token, secret);
    Token.findById(auth.id)
      .then((issue) => {
        if (issue && issue.active) {
          Object.assign(req, { auth: issue });
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
          const name = singular(User.collection.name) || 'user';
          req[name] = user;
          next();
        })
        .catch(next);
    } else {
      next();
    }
  };
};
