require('babel-polyfill');

const Resource = require('./resource');
const UserResource = require('./user.resource');
const connect = require('./connect');

module.exports = {
  Resource,
  UserResource,
  connect,
};
