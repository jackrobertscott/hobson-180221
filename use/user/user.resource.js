const { UserResource } = require('../../src/index');
const userModel = require('./user.model');

module.exports = new UserResource('user', userModel);
