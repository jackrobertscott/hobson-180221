const jwt = require('jsonwebtoken');

/**
 * Generate an authentication token which can be sent to the client to
 * verify future requests.
 */
function generateToken(payload, secret, data = {}) {
  const options = Object.assign({
    expiresIn: '30d',
  }, data);
  return {
    ...options,
    token: jwt.sign(payload, secret, options),
  };
}
module.exports.generateToken = generateToken;

/**
 * Decode a jwt token.
 */
function decodeToken(token, secret) {
  return jwt.verify(token, secret);
}
module.exports.decodeToken = decodeToken;

/**
 * Package the authentication.
 */
function authPackage(payload, secret) {
  const { token } = generateToken(payload, secret);
  const { iat, exp } = decodeToken(token, secret);
  return {
    token,
    payload,
    expires: exp,
    iat,
  };
}
module.exports.authPackage = authPackage;

/**
 * Populate a token found on the request.
 */
function tokenPopulate({ Model, secret }) {
  return (req, res, next) => {
    if (!req.headers || !req.headers.authorization) {
      next();
      return;
    }
    const token = req.headers.authorization;
    const auth = decodeToken(token, secret);
    Model.findById(auth.id)
      .then((issue) => {
        if (issue.active) {
          Object.assign(req, { auth });
        }
        next();
      })
      .catch(next);
  };
}
module.exports.tokenPopulate = tokenPopulate;

/**
 * Populate authentication on request if auth found.
 */
function authPopulate({ Model }) {
  return (req, res, next) => {
    if (!req.auth) {
      next();
      return;
    }
    if (req.auth && Model) {
      Model.findById(req.auth.userId)
        .then((user) => {
          req.user = user;
          next();
        })
        .catch(next);
    } else {
      next();
    }
  };
}
module.exports.authPopulate = authPopulate;
