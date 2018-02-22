const mongoose = require('mongoose');
const { Router } = require('express');
const { camelCase, lowerCase, pascalCase } = require('change-case');
const { plural, singular } = require('pluralize');
const { checkString } = require('./util');
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
      .set(this.localise('find'), {
        path: '/',
        method: 'get',
        handler: find(this.resourceName),
        activate: [],
      })
      .set(this.localise('findOne'), {
        path: `/:${this.resourceName}Id`,
        method: 'get',
        handler: findOne(this.resourceName),
        activate: [],
      })
      .set(this.localise('create'), {
        path: '/',
        method: 'post',
        handler: create(this.resourceName),
        activate: [],
      })
      .set(this.localise('update'), {
        path: `/:${this.resourceName}Id`,
        method: 'patch',
        handler: update(this.resourceName),
        activate: [],
      })
      .set(this.localise('remove'), {
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
  addMiddleware(id, middleware, { localise = true, start = false } = {}) {
    const key = localise ? this.localise(id) : id;
    if (!this.endpoints.has(key)) {
      throw new Error('There is no existing route with the id provided.');
    }
    const endpoint = this.endpoints.get(key);
    endpoint.activate = start ? [middleware, ...endpoint.activate] : [...endpoint.activate, middleware];
    this.endpoints.set(key, endpoint);
  }

  /**
   * Create a model specific id.
   */
  localise(id) {
    return camelCase(`${this.singleName} ${id}`);
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
      if (this.disable && this.disable.find((route) => {
        if (typeof route === 'string') {
          return this.localise(route) === key;
        }
        const id = route.localise ? this.localise(route.id) : route.id;
        return id === key;
      })) {
        return; // don't add endpoint if it is disabled
      }
      const middleware = call => (req, res, next) => call({ req, res, next, model })
        .catch(e => res.send({ error: e.message }));
      router[lowerCase(method)](
        path,
        ...activate.map(middleware),
        async (req, res, next) => {
          try {
            const data = await handler({ req, res, next, model });
            res.send(data);
          } catch (e) {
            res.send({ error: e.message });
          }
        },
      );
    });
    app.use(`/${this.manyName}`, router);
  }
}

module.exports = Resource;
