const mongoose = require('mongoose');
const Schema = require('../schema');

module.exports = class TokenSchema extends Schema {

  constructor(...args) {
    super(...args);
    this.add({
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
  }

};
