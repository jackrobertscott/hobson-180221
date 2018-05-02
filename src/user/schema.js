const bcrypt = require('bcryptjs');
const Schema = require('../schema');
const { emailRegex } = require('../utils/helpers');

module.exports = class UserSchema extends Schema {

  constructor(...args) {
    super(...args);
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
        required: true,
        select: false,
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
      if (!candidate) {
        return false;
      }
      return bcrypt.compare(candidate, this.password);
    };
  }

};
