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
  .addPermission('findOne', access.isUser());

module.exports = userResource;
