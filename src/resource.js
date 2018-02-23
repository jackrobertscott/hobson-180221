const mongoose = require('mongoose');
const { Router } = require('express');
const { camelCase, lowerCase, pascalCase } = require('change-case');
const { plural, singular } = require('pluralize');
const { checkString, checkConnection, middlify } = require('./util');
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
  static formatEndpoint([id, { path, method, handler, activate = [] }]) {
    checkString(id, { message: 'Endpoint id was not passed in as a string.' });
    checkString(path, { message: 'Endpoint path was not passed in as a string.' });
    checkString(method, { message: 'Endpoint method was not passed in as a string.' });
    if (typeof handler !== 'function') {
      throw new Error('Endpoint handler must be a function.');
    }
    if (!Array.isArray(activate)) {
      throw new Error('Endpoint activate must be an array of functions.');
    }
    return [id, {
      path,
      method: lowerCase(method),
      handler,
      activate,
    }];
  }

  /**
   * Setup the initial resource.
   */
  constructor(resourceName, schema, { endpoints = new Map(), disable = [] } = {}) {
    if (typeof resourceName !== 'string') {
      throw new Error('Parameter "resourceName" must be given to the Resource constructor as string.');
    }
    if (typeof schema !== 'object') {
      throw new Error('Parameter "schema" must be given to the Resource constructor as mongoose schema.');
    }
    if (!Array.isArray(disable)) {
      throw new Error('Parameter "options.disable" must be given to the Resource constructor as an array.');
    }
    this.resourceName = camelCase(singular(resourceName));
    this.schema = schema;
    this.disable = disable;
    this.connection = false;
    this.endpoints = new Map([
      ...this.defaults.entries(),
      ...endpoints.entries(),
    ].map(Resource.formatEndpoint));
    this.preHooks = new Map();
    this.postHooks = new Map();
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
        activate: [],
      })
      .set('findOne', {
        path: `/:${this.resourceName}Id`,
        method: 'get',
        handler: findOne(this.resourceName),
        activate: [],
      })
      .set('create', {
        path: '/',
        method: 'post',
        handler: create(this.resourceName),
        activate: [],
      })
      .set('update', {
        path: `/:${this.resourceName}Id`,
        method: 'patch',
        handler: update(this.resourceName),
        activate: [],
      })
      .set('remove', {
        path: `/:${this.resourceName}Id`,
        method: 'delete',
        handler: remove(this.resourceName),
        activate: [],
      });
    return routes;
  }

  /**
   * Add activation middleware to an endpoint.
   *
   * @param {string} id the id of the endpoint to apply the middleware
   * @param {function} middleware the middleware function
   */
  addMiddleware(id, middleware, { start = false } = {}) {
    checkConnection(this.connection);
    if (!this.endpoints.has(id)) {
      throw new Error('There is no existing route with the id provided.');
    }
    const endpoint = this.endpoints.get(id);
    endpoint.activate = start ? [middleware, ...endpoint.activate] : [...endpoint.activate, middleware];
    this.endpoints.set(id, endpoint);
  }

  /**
   * Add a hook to an endpoint function.
   */
  addPreHook(id, hook) {
    checkString(id, { method: 'addPreHook' });
    if (typeof hook !== 'function') {
      throw new Error(`Function not passed as "hook" parameter in addPreHook for "${id}".`);
    }
    let hooks = [];
    if (this.preHooks.has(id)) {
      hooks = this.preHooks.get(id);
    }
    this.preHooks.set(id, [...hooks, hook]);
  }

  /**
   * Add a hook to an endpoint function.
   */
  addPostHook(id, hook) {
    checkString(id, { method: 'addPostHook' });
    if (typeof hook !== 'function') {
      throw new Error(`Function not passed as "hook" parameter in addPostHook for "${id}".`);
    }
    let hooks = [];
    if (this.postHooks.has(id)) {
      hooks = this.postHooks.get(id);
    }
    this.postHooks.set(id, [...hooks, hook]);
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
   * Attach this resource's routes to the application.
   *
   * @param {object} app the express application instance
   */
  attach(app) {
    checkConnection(this.connection);
    if (!app) {
      throw new Error('Parameter "app" must be given to the Resource constructor as mongoose model.');
    }
    const router = Router();
    try {
      this.resourceModel = mongoose.model(this.modelName);
    } catch (e) {
      this.resourceModel = mongoose.model(this.modelName, this.schema);
    }
    this.endpoints.forEach(({
      path,
      method,
      handler,
      activate,
    }, key) => {
      if (this.disable && this.disable.find(route => route === key)) {
        return; // don't add endpoint if it is disabled
      }
      const resources = {
        model: this.resourceModel,
        context: {}, // empty object which can be used to pass information between middlewares
      };
      const middleware = activate.map(middle => middlify(middle, resources));
      const work = middlify(async (...args) => {
        if (this.preHooks.has(key)) {
          const tasks = this.preHooks.get(key).map(hook => hook(...args));
          await Promise.all(tasks);
        }
        const data = await handler(...args);
        if (this.postHooks.has(key)) {
          const tasks = this.postHooks.get(key).map(hook => hook(...args));
          await Promise.all(tasks);
        }
        return data;
      }, resources, true);
      router[lowerCase(method)](path, ...middleware, work);
    });
    app.use(`/${this.manyName}`, router);
    this.connection = true;
  }

}

module.exports = Resource;
