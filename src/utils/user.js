const HTTPStatus = require('http-status');
const { authPackage } = require('./auth');

/**
 * Login a user with the provided credentials.
 */
function login(secret) {
  return async ({ model, body: { email, password } }) => {
    const user = await model.findOne({ email });
    if (!user) {
      const error = new Error('No user was found for the given email.');
      error.code = HTTPStatus.NOT_FOUND;
      error.status = 'fail';
      throw error;
    }
    const match = await user.comparePassword(password);
    if (!match) {
      const error = new Error('Password is incorrect.');
      error.code = HTTPStatus.BAD_REQUEST;
      error.status = 'fail';
      throw error;
    }
    return {
      auth: authPackage(user, secret),
    };
  };
}
module.exports.login = login;

/**
 * Register (sign up) a new user.
 */
function register(secret) {
  return async ({ model, body }) => {
    const user = await model.create(body);
    return {
      user,
      auth: authPackage(user, secret),
    };
  };
}
module.exports.register = register;

/**
 * Logout a user from the application.
 */
function logout() {
  return () => ({ auth: null });
}
module.exports.logout = logout;
