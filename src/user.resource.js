const bcrypt = require('bcryptjs');
const Resource = require('./resource');
const { login, register, logout } = require('./utils/user');

class UserResource extends Resource {

  constructor(...args) {
    super(...args);
    const { secret } = args[0];
    if (typeof secret !== 'string') {
      throw new Error('Parameter "secret" must be given to the UserResource constructor as a string.');
    }
    this.secret = secret;
    this.schema.add({
      email: {
        type: String,
        required: true,
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
    this.addEndpoint('login', {
      path: '/login',
      method: 'post',
      handler: login(this.secret),
      permissions: [() => true],
    });
    this.addEndpoint('register', {
      path: '/register',
      method: 'post',
      handler: register(this.secret),
      permissions: [() => true],
    });
    this.addEndpoint('logout', {
      path: '/logout',
      method: 'get',
      handler: logout(),
      permissions: [() => true],
    });
  }

}

module.exports = UserResource;
