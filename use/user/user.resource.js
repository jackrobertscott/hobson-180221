const { UserResource } = require('../../lib/index');
const userSchema = require('./user.schema');

const user = new UserResource({
  name: 'User',
  schema: userSchema,
  secret: 'supersecretsecret',
});

module.exports = user.compile();
