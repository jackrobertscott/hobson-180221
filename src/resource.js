const mongoose = require('mongoose');
const { Router } = require('express');
const { camelCase, lowerCase } = require('change-case');
const { plural, singular } = require('pluralize');
const {
  checkString,
  checkCompile,
  middlify,
  hookify,
  permissionify,
  orderRoutes,
} = require('./utils/helpers');
const {
  find,
  findOne,
  create,
  update,
  remove,
} = require('./utils/controller');

class Resource {

  /**
   * Format an endpoint to make sure it matches correct standards.
   */
  static formatEndpoint([id, { path, method, handler }]) {
    checkString(id, { message: 'Endpoint id was not passed in as a string.' });
    checkString(path, { message: 'Endpoint path was not passed in as a string.' });
    checkString(method, { message: 'Endpoint method was not passed in as a string.' });
    if (typeof handler !== 'function') {
      throw new Error('Endpoint handler must be a function.');
    }
    return [id, {
      path,
      method: lowerCase(method),
      handler,
    }];
  }

  /**
   * Create the RESTful resource.
   *
   * @param {string} resourceName name of the resource
   * @param {object} schema mongoose schema
   * @param {object} options options for the resource
   * @param {array} options.disable routes to disable
   */
  constructor({
    name,
    schema,
    address,
    disable = [],
    unsecure = false,
    timestamps = true,
  } = {}) {
    if (typeof name !== 'string') {
      throw new Error('Parameter "name" must be given to the Resource constructor as a string.');
    }
    if (typeof schema !== 'object') {
      throw new Error('Parameter "schema" must be given to the Resource constructor as a mongoose schema.');
    }
    if (!Array.isArray(disable)) {
      throw new Error('Parameter "disable" must be given to the Resource constructor as an array.');
    }
    if (address && typeof address !== 'string') {
      throw new Error('Parameter "address" must be given to the Resource constructor as a string.');
    }
    this.setup = false;
    this.unsecure = unsecure;
    this.resourceName = camelCase(singular(name));
    this.address = address || `/${camelCase(plural(name))}`;
    this.name = name;
    this.schema = schema;
    this.disable = new Set(disable);
    this.endpoints = new Map([...this.defaults.entries()].map(Resource.formatEndpoint));
    this.middleware = new Map();
    this.preHooks = new Map();
    this.postHooks = new Map();
    this.permissions = new Map();
    if (timestamps) {
      this.schema.set('timestamps', true);
    }
  }

  /**
   * Setup some default CRUD functions to use for the resource.
   */
  get defaults() {
    const routes = new Map();
    routes
      .set('find', {
        path: '/',
        method: 'get',
        handler: find(this.resourceName),
      })
      .set('findOne', {
        path: `/:${this.resourceName}Id`,
        method: 'get',
        handler: findOne(this.resourceName),
      })
      .set('create', {
        path: '/',
        method: 'post',
        handler: create(this.resourceName),
      })
      .set('update', {
        path: `/:${this.resourceName}Id`,
        method: 'patch',
        handler: update(this.resourceName),
      })
      .set('remove', {
        path: `/:${this.resourceName}Id`,
        method: 'delete',
        handler: remove(this.resourceName),
      });
    return routes;
  }

  /**
   * Get the model after it has been defined.
   */
  get model() {
    try {
      return mongoose.model(this.name);
    } catch (e) {
      return mongoose.model(this.name, this.schema);
    }
  }

  /**
   * Add activation middleware to an endpoint.
   *
   * @param {string} id the id of the endpoint
   * @param {object} endpoint the endpoint data
   * @param {string} endpoint.path route path of the endpoint
   * @param {string} endpoint.method the type of HTTP request
   * @param {function} endpoint.handler function which handles an enpoint request
   */
  addEndpoint(id, endpoint) {
    checkCompile(this.setup);
    checkString(id, { message: `Endpoint id ${id} was not passed in as a string.` });
    if (typeof endpoint !== 'object') {
      throw new Error(`Endpoint data for ${id} must be an object.`);
    }
    if (endpoint.middleware && Array.isArray(endpoint.middleware)) {
      endpoint.middleware.forEach(item => this.addMiddleware(id, item));
    }
    if (endpoint.preHooks && Array.isArray(endpoint.preHooks)) {
      endpoint.preHooks.forEach(item => this.addPreHook(id, item));
    }
    if (endpoint.postHooks && Array.isArray(endpoint.postHooks)) {
      endpoint.postHooks.forEach(item => this.addPostHook(id, item));
    }
    if (endpoint.permissions && Array.isArray(endpoint.permissions)) {
      endpoint.permissions.forEach(item => this.addPermission(id, item));
    }
    const submission = Resource.formatEndpoint([id, endpoint]);
    this.endpoints.set(...submission);
    return this;
  }

  /**
   * Add activation middleware to an endpoint.
   *
   * @param {string} id the id of the endpoint to apply the middleware
   * @param {function} middleware the middleware function
   */
  addMiddleware(id, middleware) {
    checkCompile(this.setup);
    checkString(id, { method: 'addMiddleware' });
    if (typeof middleware !== 'function') {
      throw new Error(`Function not passed as "hook" parameter in addPreHook for "${id}".`);
    }
    let tasks = [];
    if (this.middleware.has(id)) {
      tasks = this.middleware.get(id);
    }
    this.middleware.set(id, [...tasks, middleware]);
    return this;
  }

  /**
   * Add a hook to an endpoint function.
   *
   * @param {string} id the id of the endpoint
   * @param {function} hook a function to run
   */
  addPreHook(id, hook) {
    checkCompile(this.setup);
    checkString(id, { method: 'addPreHook' });
    if (typeof hook !== 'function') {
      throw new Error(`Function not passed as "hook" parameter in addPreHook for "${id}".`);
    }
    let hooks = [];
    if (this.preHooks.has(id)) {
      hooks = this.preHooks.get(id);
    }
    this.preHooks.set(id, [...hooks, hook]);
    return this;
  }

  /**
   * Add a hook to an endpoint function.
   *
   * @param {string} id the id of the endpoint
   * @param {function} hook a function to run
   */
  addPostHook(id, hook) {
    checkCompile(this.setup);
    checkString(id, { method: 'addPostHook' });
    if (typeof hook !== 'function') {
      throw new Error(`Function not passed as "hook" parameter in addPostHook for "${id}".`);
    }
    let hooks = [];
    if (this.postHooks.has(id)) {
      hooks = this.postHooks.get(id);
    }
    this.postHooks.set(id, [...hooks, hook]);
    return this;
  }

  /**
   * Add a permission function to allow access to an endpoint.
   *
   * @param {string} id the id of the endpoint
   * @param {function} permission a function to run and should return a truth
   */
  addPermission(id, permission) {
    checkCompile(this.setup);
    checkString(id, { method: 'addPermission' });
    if (typeof permission !== 'function') {
      throw new Error(`Function not passed as "permission" parameter in addPermission for "${id}".`);
    }
    let permissions = [];
    if (this.permissions.has(id)) {
      permissions = this.permissions.get(id);
    }
    this.permissions.set(id, [...permissions, permission]);
    return this;
  }

  /**
   * Compile the resource and set it in stone.
   */
  compile() {
    if (this.setup) {
      throw new Error('Resource has already been setup. Calling Resource.compile() more than once.');
    }
    this.setup = true;
    this.router = Router();
    [...this.endpoints.entries()]
      .sort(orderRoutes)
      .forEach(([key, { path, method, handler }]) => {
        if (this.disable.has(key)) {
          return; // don't add endpoint if it is disabled
        }
        if (this.unsecure && !this.permissions.has(key)) {
          // if the resource is "unsecure" and has no permission set then give public permission
          this.permissions.set(key, [() => true]);
        }
        const resources = {
          model: this.model,
          context: {}, // empty object which can be used to pass information between middlewares
        };
        const middleware = this.middleware.has(key) ? this.middleware.get(key) : [];
        const permission = middlify(permissionify(key, this.permissions), resources);
        const hooked = hookify(key, handler, this.preHooks, this.postHooks);
        const work = middlify(hooked, resources, true);
        this.router[lowerCase(method)](path, ...middleware, permission, work);
      });
    return this;
  }

  /**
   * Attach this resource's routes to the application.
   *
   * @param {object} app the express application instance
   */
  attach(app) {
    if (!app) {
      throw new Error('Parameter "app" must be given provided as an express app instance.');
    }
    if (!this.setup) {
      this.compile();
    }
    app.use(this.address, this.router);
  }

}

module.exports = Resource;
