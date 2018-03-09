const { UserResource } = require('../../lib/index');
const { authenticate } = require('../../lib/utils/auth');
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
    authenticate,
  ],
});

module.exports = user;
