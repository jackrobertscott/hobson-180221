const { UserSchema } = require('../../lib/index');

const userSchema = new UserSchema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
});

module.exports = userSchema.compile('User');
