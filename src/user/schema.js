const bcrypt = require('bcryptjs');
const Schema = require('../schema');
const { emailRegex } = require('../utils/helpers');
const { authPackage } = require('../utils/auth');
const errors = require('../errors');
const Token = require('../token/model');

module.exports = class UserSchema extends Schema {

  constructor(args = {}) {
    super(args);
    this.add({
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
        select: false,
        required: !args.optionalPassword,
      },
    });
    this.pre('save', function preSave(next) {
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
    this.methods.comparePassword = function comparePassword(candidate) {
      if (!this.password) {
        throw new errors.BreakingResponse({ message: 'User has not been configured with a password.' });
      }
      if (!candidate) {
        return false;
      }
      return bcrypt.compare(candidate, this.password);
    };
    this.methods.tokenize = function tokenize({ secret, options } = {}) {
      const item = new Token({});
      const pack = authPackage({
        id: item.id,
        userId: this.id,
        email: this.email,
      }, secret, options);
      return Object.assign(item, pack).save();
    };
  }

};
