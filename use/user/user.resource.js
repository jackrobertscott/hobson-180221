const { UserResource, permissions } = require('../../lib/index');
const userSchema = require('./user.schema');

const user = new UserResource({
  name: 'User',
  schema: userSchema,
  secret: 'supersecretsecret',
});

user.addEndpoint('check', {
  path: '/check',
  method: 'get',
  handler: () => ({ working: true }),
  permissions: [
    permissions.isAuthenticated(),
  ],
});

user.addPermission('findOne', permissions.isAuthenticated());

module.exports = user;
