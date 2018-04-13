const { expect } = require('./utils/helpers');

class Route {

  /**
   * Routes are used as endpoints for an API.
   *
   * @param {string} id the id of the route used in referencing it.
   * @param {string} path the (sub) path of the route.
   * @param {string} method the method (e.g. get, post, put) of the route.
   * @param {function} handler the main function of the route.
   * @param {boolean} open set this route as unprotected by default (not recommended).
   */
  constructor({
    id,
    path,
    method,
    handler,
    open = false,
  } = {}) {
    expect({ name: 'id', value: id, type: 'string' });
    expect({ name: 'path', value: path, type: 'string' });
    expect({ name: 'method', value: method, type: 'string' });
    expect({ name: 'handler', value: handler, type: 'function' });
    expect({ name: 'open', value: open, type: 'boolean' });
    this.id = id;
    this.path = path;
    this.method = method;
    this.handler = handler;
    this.open = open;
    this.middlewares = [];
    this.permissions = [];
    this.befores = [];
    this.afters = [];
  }

  /**
   * Add a middleware to the route.
   *
   * @param {function} middleware an express middleware function.
   */
  middleware(middleware) {
    expect({ name: 'middleware', value: middleware, type: 'function' });
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Add a permission to the route.
   *
   * @param {function} permission a function (or async function) which resolved to true if allowed.
   */
  permission(permission) {
    expect({ name: 'permission', value: permission, type: 'function' });
    this.permissions.push(permission);
    return this;
  }

  /**
   * Add a before hook to the route.
   *
   * @param {function} before a function (or async function) which is run before the route handler.
   */
  before(before) {
    expect({ name: 'before', value: before, type: 'function' });
    this.befores.push(before);
    return this;
  }

  /**
   * Add a after hook to the route.
   *
   * @param {function} after a function (or async function) which is run after the route handler.
   */
  after(after) {
    expect({ name: 'after', value: after, type: 'function' });
    this.afters.push(after);
    return this;
  }

}

module.exports = (...args) => new Route(...args);
