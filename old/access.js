/**
 * Access to anyone.
 */
function isAnyone() {
  return () => true;
}
module.exports.isAnyone = isAnyone;

/**
 * Authenticate from an access token.
 */
function isTokenized() {
  return ({ req }) => req.auth && req.auth.id;
}
module.exports.isTokenized = isTokenized;

/**
 * Authenticate a user.
 */
function isUser() {
  return ({ req }) => req.user;
}
module.exports.isUser = isUser;


/**
 * Authenticate a user.
 */
function isOwner({ field = 'user' } = {}) {
  return ({ body, user }) => user && body && body[field] === user.id;
}
module.exports.isOwner = isOwner;
