module.exports = class Permission {

  /**
   * Access to anyone.
   */
  static isAnyone() {
    return () => true;
  }

  /**
   * Authenticate from an access token.
   */
  static isTokenized() {
    return ({ req }) => req.auth && req.auth.id;
  }

  /**
   * Authenticate a user.
   */
  static isUser() {
    return ({ req }) => req.user;
  }

  /**
   * Authenticate an owner of a resource.
   */
  static isOwner({ field = 'user' } = {}) {
    return ({ body, user }) => user && body && body[field] === user.id;
  }

};
