const { UserResource } = require('../../lib/index');
const userSchema = require('./user.schema');

const user = new UserResource({
  name: 'user',
  schema: userSchema,
  options: {
    timestamps: true,
  },
});

module.exports = user;
