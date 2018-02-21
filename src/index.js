const mongoose = require('mongoose');
const { Router } = require('express');
const { camelCase, lowerCase, pascalCase } = require('change-case');
const { plural, singular } = require('pluralize');
const {
  find,
  findOne,
  create,
  update,
  remove,
} = require('./controller');

class Resource {
  /**
   * Setup the initial resource.
   */
  constructor(resourceName, schema) {
    if (typeof resourceName !== 'string') {
      throw new Error('Parameter "resourceName" must be given to the Resource constructor as string.');
    }
    if (typeof schema !== 'object') {
      throw new Error('Parameter "schema" must be given to the Resource constructor as mongoose model.');
    }
    this.resourceName = camelCase(singular(resourceName));
    this.modelName = pascalCase(this.resourceName);
    this.schema = schema;
    this.endpoints = this.defaults;
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
    }) => {
      const middleware = call => (req, res, next) => call({ req, res, next, model });
      router[lowerCase(method)](
        path,
        ...activate.map(middleware),
        async (req, res, next) => {
          const data = await handler({ req, res, next, model });
          res.send(data);
        },
      );
    });
    app.use(`/${this.manyName}`, router);
  }
}

module.exports = Resource;
