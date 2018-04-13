require('babel-polyfill');

module.exports.Schema = require('./schema');
module.exports.Route = require('./route');
module.exports.Resource = require('./resource');

module.exports.attach = require('./attach');
module.exports.create = require('./create');
module.exports.access = require('./access');
module.exports.errors = require('./errors');
