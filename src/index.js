require('babel-polyfill');

const Resource = require('./resource');
const UserResource = require('./user.resource');
const TokenResource = require('./token.resource');
const connect = require('./connect');
const { ResponseError } = require('./utils/errors');
const permissions = require('./permissions');

module.exports = {
  Resource,
  UserResource,
  TokenResource,
  connect,
  ResponseError,
  permissions,
};
