'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var mongoose = require('mongoose');

var _require = require('express'),
    Router = _require.Router;

var _require2 = require('change-case'),
    camelCase = _require2.camelCase,
    lowerCase = _require2.lowerCase,
    pascalCase = _require2.pascalCase;

var _require3 = require('pluralize'),
    plural = _require3.plural,
    singular = _require3.singular;

var _require4 = require('./util'),
    checkString = _require4.checkString,
    checkCompile = _require4.checkCompile,
    middlify = _require4.middlify,
    hookify = _require4.hookify,
    permissionify = _require4.permissionify;

var _require5 = require('./controller'),
    find = _require5.find,
    findOne = _require5.findOne,
    create = _require5.create,
    update = _require5.update,
    remove = _require5.remove;

var Resource = function () {
  _createClass(Resource, null, [{
    key: 'formatEndpoint',


    /**
     * Format an endpoint to make sure it matches correct standards.
     */
    value: function formatEndpoint(_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          id = _ref2[0],
          _ref2$ = _ref2[1],
          path = _ref2$.path,
          method = _ref2$.method,
          handler = _ref2$.handler;

      checkString(id, { message: 'Endpoint id was not passed in as a string.' });
      checkString(path, { message: 'Endpoint path was not passed in as a string.' });
      checkString(method, { message: 'Endpoint method was not passed in as a string.' });
      if (typeof handler !== 'function') {
        throw new Error('Endpoint handler must be a function.');
      }
      return [id, {
        path: path,
        method: lowerCase(method),
        handler: handler
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

  }]);

  function Resource() {
    var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        name = _ref3.name,
        schema = _ref3.schema,
        _ref3$disable = _ref3.disable,
        disable = _ref3$disable === undefined ? [] : _ref3$disable;

    _classCallCheck(this, Resource);

    if (typeof name !== 'string') {
      throw new Error('Parameter "resourceName" must be given to the Resource constructor as string.');
    }
    if ((typeof schema === 'undefined' ? 'undefined' : _typeof(schema)) !== 'object') {
      throw new Error('Parameter "schema" must be given to the Resource constructor as mongoose schema.');
    }
    if (!Array.isArray(disable)) {
      throw new Error('Parameter "options.disable" must be given to the Resource constructor as an array.');
    }
    this.setup = false;
    this.resourceName = camelCase(singular(name));
    this.schema = schema;
    this.disable = new Set(disable);
    this.endpoints = new Map([].concat(_toConsumableArray(this.defaults.entries())).map(Resource.formatEndpoint));
    this.middleware = new Map();
    this.preHooks = new Map();
    this.postHooks = new Map();
    this.permissions = new Map();
  }

  /**
   * Set the name of the property used to hold an array of items.
   */


  _createClass(Resource, [{
    key: 'addEndpoint',


    /**
     * Add activation middleware to an endpoint.
     *
     * @param {string} id the id of the endpoint
     * @param {object} endpoint the endpoint data
     * @param {string} endpoint.path route path of the endpoint
     * @param {string} endpoint.method the type of HTTP request
     * @param {function} endpoint.handler function which handles an enpoint request
     */
    value: function addEndpoint(id, endpoint) {
      var _endpoints;

      checkCompile(this.setup);
      checkString(id, { message: 'Endpoint id ' + id + ' was not passed in as a string.' });
      if ((typeof endpoint === 'undefined' ? 'undefined' : _typeof(endpoint)) !== 'object') {
        throw new Error('Endpoint data for ' + id + ' must be an object.');
      }
      var submission = Resource.formatEndpoint([id, endpoint]);
      (_endpoints = this.endpoints).set.apply(_endpoints, _toConsumableArray(submission));
      return this;
    }

    /**
     * Add activation middleware to an endpoint.
     *
     * @param {string} id the id of the endpoint to apply the middleware
     * @param {function} middleware the middleware function
     */

  }, {
    key: 'addMiddleware',
    value: function addMiddleware(id, middleware) {
      checkCompile(this.setup);
      checkString(id, { method: 'addMiddleware' });
      if (typeof middleware !== 'function') {
        throw new Error('Function not passed as "hook" parameter in addPreHook for "' + id + '".');
      }
      var tasks = [];
      if (this.middleware.has(id)) {
        tasks = this.middleware.get(id);
      }
      this.middleware.set(id, [].concat(_toConsumableArray(tasks), [middleware]));
      return this;
    }

    /**
     * Add a hook to an endpoint function.
     *
     * @param {string} id the id of the endpoint
     * @param {function} hook a function to run
     */

  }, {
    key: 'addPreHook',
    value: function addPreHook(id, hook) {
      checkCompile(this.setup);
      checkString(id, { method: 'addPreHook' });
      if (typeof hook !== 'function') {
        throw new Error('Function not passed as "hook" parameter in addPreHook for "' + id + '".');
      }
      var hooks = [];
      if (this.preHooks.has(id)) {
        hooks = this.preHooks.get(id);
      }
      this.preHooks.set(id, [].concat(_toConsumableArray(hooks), [hook]));
      return this;
    }

    /**
     * Add a hook to an endpoint function.
     *
     * @param {string} id the id of the endpoint
     * @param {function} hook a function to run
     */

  }, {
    key: 'addPostHook',
    value: function addPostHook(id, hook) {
      checkCompile(this.setup);
      checkString(id, { method: 'addPostHook' });
      if (typeof hook !== 'function') {
        throw new Error('Function not passed as "hook" parameter in addPostHook for "' + id + '".');
      }
      var hooks = [];
      if (this.postHooks.has(id)) {
        hooks = this.postHooks.get(id);
      }
      this.postHooks.set(id, [].concat(_toConsumableArray(hooks), [hook]));
      return this;
    }

    /**
     * Add a permission function to allow access to an endpoint.
     *
     * @param {string} id the id of the endpoint
     * @param {function} permission a function to run and should return a truth
     */

  }, {
    key: 'addPermission',
    value: function addPermission(id, permission) {
      checkCompile(this.setup);
      checkString(id, { method: 'addPermission' });
      if (typeof permission !== 'function') {
        throw new Error('Function not passed as "permission" parameter in addPermission for "' + id + '".');
      }
      var permissions = [];
      if (this.permissions.has(id)) {
        permissions = this.permissions.get(id);
      }
      this.permissions.set(id, [].concat(_toConsumableArray(permissions), [permission]));
      return this;
    }

    /**
     * Compile the resource and set it in stone.
     */

  }, {
    key: 'compile',
    value: function compile() {
      var _this = this;

      try {
        this.resourceModel = mongoose.model(this.modelName);
      } catch (e) {
        this.resourceModel = mongoose.model(this.modelName, this.schema);
      }
      this.router = Router();
      this.endpoints.forEach(function (_ref4, key) {
        var _router;

        var path = _ref4.path,
            method = _ref4.method,
            handler = _ref4.handler;

        if (_this.disable.has(key)) {
          return; // don't add endpoint if it is disabled
        }
        var resources = {
          model: _this.resourceModel,
          context: {} // empty object which can be used to pass information between middlewares
        };
        var middleware = _this.middleware.has(key) ? _this.middleware.get(key) : [];
        var permission = middlify(permissionify(key, _this.permissions), resources);
        var hooked = hookify(key, handler, _this.preHooks, _this.postHooks);
        var work = middlify(hooked, resources, true);
        (_router = _this.router)[lowerCase(method)].apply(_router, [path].concat(_toConsumableArray(middleware), [permission, work]));
      });
      this.setup = true;
      return this;
    }

    /**
     * Attach this resource's routes to the application.
     *
     * @param {object} app the express application instance
     */

  }, {
    key: 'attach',
    value: function attach(app) {
      if (!app) {
        throw new Error('Parameter "app" must be given provided as an express app instance.');
      }
      if (!this.setup) {
        throw new Error('Please compile the resource before it is attached to an app.');
      }
      app.use('/' + this.manyName, this.router);
    }
  }, {
    key: 'manyName',
    get: function get() {
      return plural(this.resourceName);
    }

    /**
     * Set the name of the property used to hold an singular of item.
     */

  }, {
    key: 'singleName',
    get: function get() {
      return singular(this.resourceName);
    }

    /**
     * Set the name of the property used to set the mongodb collection.
     */

  }, {
    key: 'modelName',
    get: function get() {
      return pascalCase(this.resourceName);
    }

    /**
     * Setup some default CRUD functions to use for the resource.
     */

  }, {
    key: 'defaults',
    get: function get() {
      var routes = new Map();
      routes.set('find', {
        path: '/',
        method: 'get',
        handler: find(this.resourceName)
      }).set('findOne', {
        path: '/:' + this.resourceName + 'Id',
        method: 'get',
        handler: findOne(this.resourceName)
      }).set('create', {
        path: '/',
        method: 'post',
        handler: create(this.resourceName)
      }).set('update', {
        path: '/:' + this.resourceName + 'Id',
        method: 'patch',
        handler: update(this.resourceName)
      }).set('remove', {
        path: '/:' + this.resourceName + 'Id',
        method: 'delete',
        handler: remove(this.resourceName)
      });
      return routes;
    }

    /**
     * Get the model after it has been defined.
     */

  }, {
    key: 'model',
    get: function get() {
      if (!this.resourceModel) {
        throw new Error('Please run Resource.attach() before attempting to get the model');
      }
      return this.resourceModel;
    }
  }]);

  return Resource;
}();

module.exports = Resource;