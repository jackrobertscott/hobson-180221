const { UserResource, access } = require('../../lib/index');
const userSchema = require('./user.schema');

const userResource = new UserResource({
  name: 'User',
  schema: userSchema,
});

userResource
  .addEndpoint('check', {
    path: '/check',
    method: 'get',
    handler: () => ({ working: true }),
  })
  .addPermission('check', access.isUser());

userResource
  .addPermission('findById', access.isUser())
  .addPermission('changePassword', access.isUser())
  .addPermission('forgotPassword', access.isAnyone())
  .addPermission('resetPassword', access.isTokenized());

module.exports = userResource;
