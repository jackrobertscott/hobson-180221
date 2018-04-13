const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { expect, emailRegex } = require('./utils/helpers');

module.exports = function schema({ shape = {}, options = {}, type = 'standard', timestamps = true, safe = true } = {}) {
  expect({ name: 'shape', value: shape, type: 'object' });
  expect({ name: 'options', value: options, type: 'object' });
  expect({ name: 'type', value: shape, type: 'string' });
  const configuration = Object.assign({ timestamps }, options);
  const mixins = {};
  if (safe) {
    Object.assign(mixins, {
      deleted: {
        type: Boolean,
        required: true,
        default: false,
      },
    });
    if (configuration.timestamps) {
      Object.assign(mixins, {
        deletedAt: {
          type: Date,
        },
      });
    }
  }
  const item = new mongoose.Schema(Object.assign(mixins, shape), configuration);
  switch (type) {
    case 'token':
      item.add({
        token: {
          type: String,
          required: true,
        },
        payload: {
          type: mongoose.Schema.Types.Mixed,
          required: true,
        },
        expires: {
          type: Number,
          required: true,
        },
        iat: {
          type: Number,
          required: true,
        },
        active: {
          type: Boolean,
          required: true,
          default: true,
        },
      });
      break;
    case 'user':
      item.add({
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
      item.pre('save', function preSave(next) {
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
      item.methods.comparePassword = function comparePassword(candidate) {
        return bcrypt.compare(candidate, this.password);
      };
      break;
    default:
      // nothing...
      break;
  }
  return item;
};
