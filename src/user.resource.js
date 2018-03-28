const bcrypt = require('bcryptjs');
const Resource = require('./resource');
const { login, register, logout } = require('./utils/user');
const { emailRegex } = require('./utils/helpers');

class UserResource extends Resource {

  constructor(...args) {
    super(...args);
    this.auth = true;
    this.schema.add({
      email: {
        type: String,
        required: true,
        unique: true,
        validate: {
          validator: email => emailRegex.test(email),
          message: 'not a valid email format e.g. example@email.com',
        },
      },
      password: {
        type: String,
        required: true,
        select: false,
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
      open: true,
      handler: login(options),
    });
    this.addEndpoint('register', {
      path: '/register',
      method: 'post',
      open: true,
      handler: register(options),
    });
    this.addEndpoint('logout', {
      path: '/logout',
      method: 'get',
      open: true,
      handler: logout(options),
    });
  }

}
module.exports = UserResource;
