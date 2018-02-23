const Resource = require('./resource');
const bcrypt = require('bcryptjs');

class UserResource extends Resource {

  constructor(...args) {
    super(...args);
    this.schema.add({
      password: {
        type: String,
        required: true,
      },
    });
    this.schema.pre('save', function preSave(next) {
      if (!this.isModified('password')) {
        next();
      } else {
        bcrypt.genSalt(5)
          .then(salt => bcrypt.hash(this.password, salt))
          .then((hash) => {
            this.password = hash;
            next();
          })
          .catch(next);
      }
    });
    this.schema.methods.comparePassword = function comparePassword(candidate) {
      return bcrypt.compare(candidate, this.password);
    };
  }

  get defaults() {
    return super.defaults
      .set('login', {
        path: '/action/login',
        method: 'get',
        handler: async () => ({ login: false }),
        activate: [],
      });
  }

}

module.exports = UserResource;
