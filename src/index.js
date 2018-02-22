const mongoose = require('mongoose');
const { Router } = require('express');
const { camelCase, lowerCase, pascalCase } = require('change-case');
const { plural, singular } = require('pluralize');
const { checkString, middlify } = require('./util');
const {
  find,
  findOne,
  create,
  update,
  remove,
} = require('./controller');

class Resource {

  /**
   * Format an endpoint to make sure it matches the correct standards.
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
   * Create the RESTful resource.
   *
   * @param {string} resourceName name of the resource
   * @param {object} schema mongoose schema
   * @param {object} options options for the resource
   * @param {Map} options.endpoints custom routes for the resource
   * @param {array} options.disable routes to disable
   */
  constructor(resourceName, schema, { endpoints = new Map(), disable = [] } = {}) {
    if (typeof resourceName !== 'string') {
      throw new Error('Parameter "resourceName" must be given to the Resource constructor as string.');
    }
    if (typeof schema !== 'object') {
      throw new Error('Parameter "schema" must be given to the Resource constructor as mongoose model.');
    }
    if (!Array.isArray(disable)) {
      throw new Error('Parameter "options.disable" must be given to the Resource constructor as an array.');
    }
    this.resourceName = camelCase(singular(resourceName));
    this.modelName = pascalCase(this.resourceName);
    this.schema = schema;
    this.disable = disable;
    this.endpoints = new Map([
      ...this.defaults.entries(),
      ...endpoints.entries(),
    ].map(Resource.formatEndpoint));
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
    if (!this.endpoints.has(id)) {
      throw new Error('There is no existing route with the id provided.');
    }
    const endpoint = this.endpoints.get(id);
    endpoint.activate = start ? [middleware, ...endpoint.activate] : [...endpoint.activate, middleware];
    this.endpoints.set(id, endpoint);
  }

  /**
   * Add activation middleware to an endpoint.
   *
   * @param {string} id the id of the endpoint
   * @param {object} endpoint the endpoint data
   * @param {string} endpoint.path route path of the endpoint
   * @param {string} endpoint.method the type of HTTP request
   * @param {function} endpoint.handler function which handles an enpoint request
   * @param {array} endpoint.activate middleware called before the handler function is invoked
   */
  addEndpoint(id, endpoint) {
    checkString(id, { message: `Endpoint id ${id} was not passed in as a string.` });
    if (typeof endpoint !== 'object') {
      throw new Error(`Endpoint data for ${id} must be an object.`);
    }
    this.endpoints.set(formatEndpoint([id, endpoint]));
  }

  /**
   * Attach this resource's routes to the application.
   *
   * @param {object} app the express application instance
   */
  attach(app) {
    if (!app) {
      throw new Error('Parameter "app" must be given to the Resource constructor as mongoose model.');
    }
    const model = mongoose.model(this.modelName, this.schema);
    const router = Router();
    this.endpoints.forEach(({
      path,
      method,
      handler,
      activate,
    }, key) => {
      if (this.disable && this.disable.find(route => route === key)) {
        return; // don't add endpoint if it is disabled
      }
      const resources = { model };
      const middleware = activate.map(middle => middlify(middle, resources));
      const work = middlify(handler, resources, true);
      router[lowerCase(method)](path, ...middleware, work);
    });
    app.use(`/${this.manyName}`, router);
  }
}

module.exports = Resource;

/**
 * Documentation standard:
 * JSDoc 3 documentation project. (http://usejsdoc.org)
 */