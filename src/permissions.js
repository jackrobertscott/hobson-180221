/**
 * Authenticate a user.
 */
function isAuthenticated() {
  return ({ req }) => req.auth && req.auth.id;
}
module.exports.isAuthenticated = isAuthenticated;

/**
 * Authenticate a user.
 */
function isUser() {
  return ({ req }) => req.user;
}
module.exports.isUser = isUser;
