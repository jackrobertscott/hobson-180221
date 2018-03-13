const Resource = require('./resource');
const { Schema } = require('mongoose');
const jwt = require('jsonwebtoken');

class TokenResource extends Resource {

  static generate(secret, payload, { expires } = {}) {
    return jwt.sign(payload, secret, {
      expiresIn: expires || '30d',
    });
  }

  constructor(...args) {
    super(...args);
    this.secret = args[0].secret;
    this.token = true;
    this.schema.add({
      token: {
        type: String,
        required: true,
      },
      payload: {
        type: Schema.Types.Mixed,
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

}
module.exports = TokenResource;
