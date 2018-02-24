const bcrypt = require('bcryptjs');
const HTTPStatus = require('http-status');
const Resource = require('./resource');
const { generateToken } = require('./utils/auth');

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
        handler: async ({ model, body: { email, password } }) => {
          const user = await model.findOne({ email });
          if (!user) {
            const error = new Error('No user was found for the given email.');
            error.code = HTTPStatus.NOT_FOUND;
            throw error;
          }
          const match = await user.comparePassword(password);
          if (!match) {
            const error = new Error('Password is incorrect.');
            error.code = HTTPStatus.NOT_FOUND;
            throw error;
          }
          return {
            auth: {
              token: generateToken(user),
              id: user.id,
              email: user.email,
              user,
            },
          };
        },
      })
      .set('logout', {
        path: '/action/login',
        method: 'get',
        handler: () => ({ auth: null }),
      });
  }

}

module.exports = UserResource;
