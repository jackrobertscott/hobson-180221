require('babel-polyfill');

const Resource = require('./resource');
const UserResource = require('./user.resource');
const connect = require('./connect');
const { createError } = require('./utils/helpers');

module.exports = {
  Resource,
  UserResource,
  connect,
  createError,
};
