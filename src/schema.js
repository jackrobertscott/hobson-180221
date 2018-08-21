const mongoose = require('mongoose');
const { expect } = require('./utils/helpers');

module.exports = class Schema extends mongoose.Schema {

  /**
   * Routes are used as endpoints for an API.
   */
  constructor({
    type,
    shape = {},
    options = {},
    timestamps = true,
    safe = false,
  } = {}) {
    expect({ name: 'type', value: type, type: 'string', optional: true });
    expect({ name: 'shape', value: shape, type: 'object' });
    expect({ name: 'options', value: options, type: 'object' });
    expect({ name: 'timestamps', value: timestamps, type: 'boolean' });
    expect({ name: 'safe', value: safe, type: 'boolean' });
    const configuration = Object.assign({ timestamps, safe }, options);
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
    const structure = Object.assign(mixins, shape);
    super({ ...structure }, { ...configuration });
    this.context = {
      options: configuration,
      shape: structure,
    };
  }

  /**
   * Defines a model on the database with this schema.
   *
   * @param {string} name the name of the model to be saved to the database.
   */
  compile(name) {
    expect({ name: 'name', value: name, type: 'string' });
    return mongoose.model(name, this);
  }

};
