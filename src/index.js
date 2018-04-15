require('babel-polyfill');

const mongoose = require('mongoose');

mongoose.Promise = Promise;

module.exports.attach = require('./attach');
module.exports.errors = require('./errors');

module.exports.Schema = require('./schema');
module.exports.Route = require('./route');
module.exports.Resource = require('./resource');
module.exports.Permission = require('./permission');

module.exports.TokenSchema = require('./token/schema');
module.exports.UserSchema = require('./user/schema');
module.exports.UserResource = require('./user/resource');

module.exports.mongoose = mongoose;
module.exports.Types = mongoose.Types;
module.exports.connect = (...args) => mongoose.connect(...args);
module.exports.model = (...args) => mongoose.model(...args);
