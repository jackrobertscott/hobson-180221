const { UserResource, Permission } = require('../../lib/index');
const User = require('./user.model');

const userResource = new UserResource({ model: User });

/**
 * Custom endpoints.
 */
userResource.add({
  id: 'check',
  path: '/check',
  method: 'get',
  handler: () => ({ working: true }),
});
userResource.get('check').access(Permission.isUser());

/**
 * General permissions.
 */
userResource.get('findById').access(Permission.isUser());
userResource.get('changePassword').access(Permission.isUser());
userResource.get('forgotPassword').access(Permission.isAnyone());
userResource.get('resetPassword').access(Permission.isTokenized());

module.exports = userResource;
