const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { expect, emailRegex } = require('./utils/helpers');

module.exports = class Schema extends mongoose.Schema {

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
    type,
    shape = {},
    options = {},
    timestamps = true,
    safe = true,
  } = {}) {
    expect({ name: 'type', value: type, type: 'string', optional: true });
    expect({ name: 'shape', value: shape, type: 'object' });
    expect({ name: 'options', value: options, type: 'object' });
    expect({ name: 'timestamps', value: timestamps, type: 'boolean' });
    expect({ name: 'safe', value: safe, type: 'boolean' });
    const configuration = Object.assign({ timestamps }, options);
    const mixins = {};
    if (safe) {
      Object.assign(mixins, {
        deleted: {
          type: Boolean,
          required: true,
          default: false,
        },
      });
      if (configuration.timestamps) {
        Object.assign(mixins, {
          deletedAt: {
            type: Date,
          },
        });
      }
    }
    super(Object.assign(mixins, shape), configuration);
    switch (type) {
      case 'token':
        this.add({
          token: {
            type: String,
            required: true,
          },
          payload: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
          },
          expires: {
            type: Number,
            required: true,
          },
          iat: {
            type: Number,
            required: true,
          },
          active: {
            type: Boolean,
            required: true,
            default: true,
          },
        });
        break;
      case 'user':
        this.add({
          email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            validate: {
              validator: email => emailRegex.test(email),
              message: 'not a valid email format e.g. example@email.com',
            },
          },
          password: {
            type: String,
            required: true,
            select: false,
          },
        });
        this.pre('save', function preSave(next) {
          if (!this.isModified('password')) {
            next();
          } else {
            bcrypt.genSalt(5)
              .then(salt => bcrypt.hash(this.password, salt))
              .then((hash) => {
                this.password = hash;
                next();
              })
              .catch(next);
          }
        });
        this.methods.comparePassword = function comparePassword(candidate) {
          return bcrypt.compare(candidate, this.password);
        };
        break;
      default:
        break;
    }
  }

};
