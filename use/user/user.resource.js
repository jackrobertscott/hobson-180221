const { UserResource } = require('../../lib/index');
const userSchema = require('./user.schema');

module.exports = new UserResource('user', userSchema);
