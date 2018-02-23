const mongoose = require('mongoose');
const { Router } = require('express');
const { camelCase, lowerCase, pascalCase } = require('change-case');
const { plural, singular } = require('pluralize');
const { checkString, checkCompile, middlify, hookify, permissionify } = require('./util');
const {
  find,
  findOne,
  create,
  update,
  remove,
} = require('./controller');

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
  constructor({ name, schema, disable = [] } = {}) {
    if (typeof name !== 'string') {
      throw new Error('Parameter "resourceName" must be given to the Resource constructor as string.');
    }
    if (typeof schema !== 'object') {
      throw new Error('Parameter "schema" must be given to the Resource constructor as mongoose schema.');
    }
    if (!Array.isArray(disable)) {
      throw new Error('Parameter "options.disable" must be given to the Resource constructor as an array.');
    }
    this.setup = false;
    this.resourceName = camelCase(singular(name));
    this.schema = schema;
    this.disable = new Set(disable);
    this.endpoints = new Map([...this.defaults.entries()].map(Resource.formatEndpoint));
    this.middleware = new Map();
    this.preHooks = new Map();
    this.postHooks = new Map();
    this.permissions = new Map();
  }

  /**
   * Set the name of the property used to hold an array of items.
   */
  get manyName() {
    return plural(this.resourceName);
  }

  /**
   * Set the name of the property used to hold an singular of item.
   */
  get singleName() {
    return singular(this.resourceName);
  }

  /**
   * Set the name of the property used to set the mongodb collection.
   */
  get modelName() {
    return pascalCase(this.resourceName);
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
    if (!this.resourceModel) {
      throw new Error('Please run Resource.attach() before attempting to get the model');
    }
    return this.resourceModel;
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
    try {
      this.resourceModel = mongoose.model(this.modelName);
    } catch (e) {
      this.resourceModel = mongoose.model(this.modelName, this.schema);
    }
    this.router = Router();
    this.endpoints.forEach(({ path, method, handler }, key) => {
      if (this.disable.has(key)) {
        return; // don't add endpoint if it is disabled
      }
      const resources = {
        model: this.resourceModel,
        context: {}, // empty object which can be used to pass information between middlewares
      };
      const middleware = this.middleware.has(key) ? this.middleware.get(key) : [];
      const permission = middlify(permissionify(key, this.permissions), resources);
      const hooked = hookify(key, handler, this.preHooks, this.postHooks);
      const work = middlify(hooked, resources, true);
      this.router[lowerCase(method)](path, ...middleware, permission, work);
    });
    this.setup = true;
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
      throw new Error('Please compile the resource before it is attached to an app.');
    }
    app.use(`/${this.manyName}`, this.router);
  }

}

module.exports = Resource;
