const jwt = require('jsonwebtoken');
const HTTPStatus = require('http-status');

/**
 * Generate an authentication token which can be sent to the client to
 * verify future requests.
 */
function generateToken({ id, email, role }, secret) {
  return jwt.sign({ id, email, role }, secret, {
    expiresIn: '1m',
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
async function authenticate({ req, model }) {
  if (!req.headers || !req.headers.authorization) {
    const error = new Error('No authorisation token attached to request.');
    error.code = HTTPStatus.UNAUTHORIZED;
    throw error;
  }
  const { id } = decodeToken(req.headers.authorization);
  const user = await model.findById(id);
  if (!user) {
    const error = new Error('No user was found for the given id.');
    error.code = HTTPStatus.UNAUTHORIZED;
    throw error;
  }
  Object.assign(req, { user });
}
module.exports.authenticate = authenticate;
