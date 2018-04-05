const bcrypt = require('bcryptjs');
const Resource = require('./resource');
const { emailRegex } = require('./utils/helpers');
const {
  login,
  register,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
} = require('./utils/user');

class UserResource extends Resource {

  constructor(...args) {
    super(...args);
    this.auth = true;
    this.schema.add({
      email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
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
    this.addEndpoint('changePassword', {
      path: '/password/change',
      method: 'post',
      handler: changePassword(options),
    });
    this.addEndpoint('forgotPassword', {
      path: '/password/forgot',
      method: 'post',
      handler: forgotPassword(options),
    });
    this.addEndpoint('resetPassword', {
      path: '/password/reset',
      method: 'post',
      handler: resetPassword(options),
    });
  }

}
module.exports = UserResource;
