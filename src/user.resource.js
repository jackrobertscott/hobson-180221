const bcrypt = require('bcryptjs');
const Resource = require('./resource');
const { login, register, logout } = require('./utils/user');

class UserResource extends Resource {

  constructor(...args) {
    super(...args);
    this.auth = true;
    this.schema.add({
      email: {
        type: String,
        required: true,
        unique: true,
      },
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

  /**
   * Add the user endpoints.
   */
  addExtensions(options) {
    this.addEndpoint('login', {
      path: '/login',
      method: 'post',
      handler: login(options),
      permissions: [() => true],
    });
    this.addEndpoint('register', {
      path: '/register',
      method: 'post',
      handler: register(options),
      permissions: [() => true],
    });
    this.addEndpoint('logout', {
      path: '/logout',
      method: 'get',
      handler: logout(options),
      permissions: [() => true],
    });
  }

}
module.exports = UserResource;
