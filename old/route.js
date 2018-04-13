const { checkString } = require('./utils/helpers');

class Route {

  /**
   * Create a helper route for working with a resource.
   */
  constructor({ id, resource }) {
    checkString(id, { message: 'Expected "id" parameter to be a string.' });
    if (typeof resource !== 'object') {
      throw new Error('Expected "resource" parameter to be a Resource instance.');
    }
    this.id = id;
    this.resource = resource;
  }

  /**
   * Add activation middleware to an endpoint.
   *
   * @param {object} endpoint the endpoint data
   */
  addEndpoint(endpoint) {
    this.resource.addEndpoint(this.id, endpoint);
    return this;
  }

  /**
   * Add activation middleware to an endpoint.
   *
   * @param {function} middleware the middleware function
   */
  addMiddleware(middleware) {
    this.resource.addMiddleware(this.id, middleware);
    return this;
  }

  /**
   * Add a hook to an endpoint function.
   *
   * @param {function} hook a function to run
   */
  addPreHook(hook) {
    this.resource.addPreHook(this.id, hook);
    return this;
  }

  /**
   * Add a hook to an endpoint function.
   *
   * @param {function} hook a function to run
   */
  addPostHook(hook) {
    this.resource.addPostHook(this.id, hook);
    return this;
  }

  /**
   * Add a permission function to allow access to an endpoint.
   *
   * @param {function} permission a function to run and should return a truth
   */
  addPermission(permission) {
    this.resource.addPermission(this.id, permission);
    return this;
  }

}
module.exports = Route;
