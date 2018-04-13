const mongoose = require('mongoose');
const { expect } = require('./utils/helpers');

module.exports = function schema({ shape, options = {}, timestamps = true, safe = true } = {}) {
  expect({ name: 'shape', value: shape, type: 'object' });
  expect({ name: 'options', value: options, type: 'object' });
  const configuration = Object.assign({ timestamps }, options);
  const structure = safe ? Object.assign({
    deleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  }, shape) : shape;
  if (safe && configuration.timestamps) {
    structure.deletedAt = {
      type: Date,
    };
  }
  return new mongoose.Schema(structure, configuration);
};
