const { Router } = require('express');
const { camelCase, lowerCase } = require('change-case');
const { plural, singular } = require('pluralize');
const route = require('./route');
const errors = require('./errors');
const {
  expect,
  middlify,
  hookify,
  permissionify,
  orderRoutes,
} = require('./utils/helpers');
const {
  find,
  count,
  findOne,
  findById,
  create,
  update,
  remove,
} = require('./utils/defaults');

class Resource {

  /**
   * Routes are used as endpoints for an API.
   *
   * @param {string} name the name of the resource used for making paths and variables.
   * @param {string} model the model as created by hobson.
   */
  constructor({
    model,
    name,
    address,
    options = {},
  } = {}) {
    expect({ name: 'model', value: model, type: 'object' });
    expect({ name: 'name', value: name, type: 'string', optional: true });
    expect({ name: 'address', value: name, type: 'string', optional: true });
    expect({ name: 'options', value: options, type: 'object' });
    const nickname = name || model.modelName;
    this.name = camelCase(singular(nickname));
    this.address = address || `/${camelCase(plural(nickname))}`;
    this.model = model;
    this.options = options;
    this.routes = new Map();
  }

  /**
   * Set the defaults onto the resource.
   */
  defaults() {
    this.add({
      id: 'find',
      path: '/',
      method: 'get',
      handler: find(this.name, this.options),
    });
    this.add({
      id: 'count',
      path: '/count',
      method: 'get',
      handler: count(this.name, this.options),
    });
    this.add({
      id: 'findOne',
      path: '/one',
      method: 'get',
      handler: findOne(this.name, this.options),
    });
    this.add({
      id: 'findById',
      path: `/:${this.name}Id`,
      method: 'get',
      handler: findById(this.name, this.options),
    });
    this.add({
      id: 'create',
      path: '/',
      method: 'post',
      handler: create(this.name, this.options),
    });
    this.add({
      id: 'update',
      path: `/:${this.name}Id`,
      method: 'patch',
      handler: update(this.name, this.options),
    });
    this.add({
      id: 'remove',
      path: `/:${this.name}Id`,
      method: 'delete',
      handler: remove(this.name, this.options),
    });
  }

  /**
   * Add a route to the resource.
   *
   * @param {object} data the route to add to the resource.
   */
  add(data) {
    expect({ name: 'data', value: data, type: 'object' });
    if (typeof data.permission === 'function' && typeof data.before === 'function' && typeof data.after === 'function') {
      this.routes.set(route.id, data);
    } else {
      this.routes.set(data.id, route(data));
    }
    return this;
  }

  /**
   * Get the route with the id provided.
   *
   * @param {string} id the id matching the route.
   */
  route(id) {
    expect({ name: 'id', value: id, type: 'string' });
    if (this.routes.has(id)) {
      return this.routes.get(id);
    }
    throw new errors.Response({ message: `No route with the id "${id}" was found on the resource.` });
  }

  /**
   * Generate a express router from the resource.
   */
  compile() {
    const router = Router();
    [...this.routes.entries()]
      .sort(orderRoutes)
      .forEach(([key, item]) => {
        const unsecure = typeof item.open === 'boolean' ? item.open : this.unsecure;
        const resources = {
          Model: this.model,
          context: {}, // empty object which can be used to pass information between middlewares
        };
        const middleware = this.middleware.has(key) ? this.middleware.get(key) : [];
        const permission = middlify(permissionify(key, this.permissions, unsecure), resources);
        const hooked = hookify(key, item.handler, this.preHooks, this.postHooks);
        const work = middlify(hooked, resources, true);
        this.router[lowerCase(item.method)](item.path, ...middleware, permission, work);
      });
    return router;
  }

  /**
   * Attach the resources routes to an express app.
   */
  attach(app) {
    if (app && typeof app.use === 'function') {
      app.use(this.address, this.compile());
    }
    throw new errors.Response({ message: `Expected "app" paramater to be an express app but got ${app}.` });
  }

}

module.exports = (...args) => new Resource(...args);
