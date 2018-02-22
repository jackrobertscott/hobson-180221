const { UserResource } = require('../../src/index');
const userSchema = require('./user.schema');

module.exports = new UserResource('user', userSchema);
