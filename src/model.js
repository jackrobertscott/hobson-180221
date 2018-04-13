const mongoose = require('mongoose');
const { expect } = require('./utils/helpers');

module.exports = function model({ name, schema } = {}) {
  expect({ name: 'name', value: name, type: 'string' });
  expect({ name: 'schema', value: schema, type: 'object' });
  return mongoose.model(name, schema);
};
