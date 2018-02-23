'use strict';

require('babel-polyfill');

var Resource = require('./resource');
var UserResource = require('./user.resource');

module.exports = {
  Resource: Resource,
  UserResource: UserResource
};