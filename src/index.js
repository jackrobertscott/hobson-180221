require('babel-polyfill');

module.exports.attach = require('./attach');
module.exports.access = require('./access');
module.exports.errors = require('./errors');

module.exports.Schema = require('./schema');
module.exports.Route = require('./route');
module.exports.Resource = require('./resource');

module.exports.TokenSchema = require('./token/schema');
module.exports.UserResource = require('./user/resource');
module.exports.UserSchema = require('./user/schema');
