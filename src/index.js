require('babel-polyfill');

const Resource = require('./resource');
const UserResource = require('./user.resource');
const TokenResource = require('./token.resource');
const connect = require('./connect');
const { createError } = require('./utils/helpers');
const permissions = require('./permissions');

module.exports = {
  Resource,
  UserResource,
  TokenResource,
  connect,
  createError,
  permissions,
};
