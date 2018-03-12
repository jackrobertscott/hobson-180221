const jwt = require('jsonwebtoken');

/**
 * Generate an authentication token which can be sent to the client to
 * verify future requests.
 */
function generateToken({ id, email, role }, secret) {
  return jwt.sign({ id, email, role }, secret, {
    expiresIn: '30d',
  });
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
function authPackage(user, secret) {
  return {
    token: generateToken(user, secret),
    id: user.id,
    email: user.email,
  };
}
module.exports.authPackage = authPackage;

/**
 * Authenticate a user.
 */
async function authenticate({ req }) {
  return req.auth && req.auth.id && req.user;
}
module.exports.authenticate = authenticate;

/**
 * Populate authentication on request if auth found.
 */
function authPopulate({ model, secret }) {
  return (req, res, next) => {
    if (!req.headers || !req.headers.authorization) {
      next();
      return;
    }
    req.auth = decodeToken(req.headers.authorization, secret);
    if (req.auth && model) {
      model.findById(req.auth.id)
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
