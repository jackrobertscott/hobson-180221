const { Router } = require('express');
const { camelCase, lowerCase } = require('lodash');
const { plural, singular } = require('pluralize');
const Route = require('./route');
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

module.exports = class Resource {

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
    unsecure = false,
  } = {}) {
    expect({ name: 'model', value: model, type: 'function' });
    expect({ name: 'name', value: name, type: 'string', optional: true });
    expect({ name: 'address', value: name, type: 'string', optional: true });
    expect({ name: 'unsecure', value: unsecure, type: 'boolean', optional: true });
    expect({ name: 'options', value: options, type: 'object' });
    const nickname = name || model.modelName;
    this.name = camelCase(singular(nickname));
    this.address = address || `/${camelCase(plural(nickname))}`;
    this.model = model;
    this.options = Object.assign({ name: this.name }, this.model.schema.context.options, options);
    this.routes = new Map();
    this.unsecure = unsecure;
    this.defaults();
  }

  /**
   * Set the defaults onto the resource.
   */
  defaults() {
    this.add({
      id: 'find',
      path: '/',
      method: 'get',
      handler: (...args) => find(this.options)(...args),
    });
    this.add({
      id: 'count',
      path: '/count',
      method: 'get',
      handler: (...args) => count(this.options)(...args),
    });
    this.add({
      id: 'findOne',
      path: '/one',
      method: 'get',
      handler: (...args) => findOne(this.options)(...args),
    });
    this.add({
      id: 'findById',
      path: `/:${this.name}Id`,
      method: 'get',
      handler: (...args) => findById(this.options)(...args),
    });
    this.add({
      id: 'create',
      path: '/',
      method: 'post',
      handler: (...args) => create(this.options)(...args),
    });
    this.add({
      id: 'update',
      path: `/:${this.name}Id`,
      method: 'patch',
      handler: (...args) => update(this.options)(...args),
    });
    this.add({
      id: 'remove',
      path: `/:${this.name}Id`,
      method: 'delete',
      handler: (...args) => remove(this.options)(...args),
    });
  }

  /**
   * Set some options on a resource.
   *
   * @param {object} option an object with key/value pairs to set as options.
   */
  option(option = {}) {
    this.options = Object.assign({}, option, this.options);
  }

  /**
   * Add a route to the resource.
   *
   * @param {object} data the route to add to the resource.
   */
  add(data) {
    expect({ name: 'data', value: data, type: 'object' });
    if (typeof data.access === 'function' && typeof data.before === 'function' && typeof data.after === 'function') {
      this.routes.set(data.id, data);
    } else {
      this.routes.set(data.id, new Route(data));
    }
    this.last = data.id;
    return this;
  }

  /**
   * Get the route with the id provided.
   *
   * @param {string} id the id matching the route.
   */
  get(id) {
    expect({ name: 'id', value: id, type: 'string' });
    if (this.routes.has(id)) {
      return this.routes.get(id);
    }
    throw new errors.Response({ message: `No route with the id "${id}" was found on the resource.` });
  }

  /**
   * Get the last route which was added to the resource.
   */
  refine() {
    if (!this.last) {
      throw new errors.Response({ message: 'Route muse be added before calling refine().' });
    }
    if (!this.routes.has(this.last)) {
      throw new errors.Response({ message: 'Last route no longer exists on the resource.' });
    }
    return this.routes.get(this.last);
  }

  /**
   * Generate a express router from the resource.
   */
  compile() {
    const router = Router();
    [...this.routes.entries()]
      .sort(orderRoutes)
      .forEach(([key, route]) => {
        const unsecure = typeof route.open === 'boolean' ? route.open : this.unsecure;
        const resources = {
          Model: this.model,
          context: {}, // empty object which can be used to pass information between methods
        };
        const permission = middlify(permissionify(key, route.permissions, unsecure), resources);
        const hooked = hookify(key, route.handler, route.befores, route.afters);
        const work = middlify(hooked, resources, true);
        router[lowerCase(route.method)](route.path, ...route.middlewares, permission, work);
      });
    return router;
  }

  /**
   * Attach the resources routes to an express app.
   *
   * @param {function} app the express app instance.
   */
  attach(app) {
    if (app && typeof app.use === 'function') {
      return app.use(this.address, this.compile());
    }
    throw new errors.Response({ message: `Expected "app" paramater to be an express app but got ${typeof app}.` });
  }

};
