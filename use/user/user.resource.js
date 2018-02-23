const { UserResource } = require('../../lib/index');
const userSchema = require('./user.schema');

const user = new UserResource('user', userSchema);

module.exports = user.compile();
