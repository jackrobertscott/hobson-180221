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
    this.auth = true;
    const { secret } = args[0];
    if (typeof secret !== 'string') {
      throw new Error('Parameter "secret" must be given to the TokenResource constructor as a string.');
    }
    this.secret = secret;
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
    });
    this.addEndpoint('create', {
      path: '/',
      method: 'post',
      handler: async ({ model, body }) => {
        const { payload, expires } = body;
        const token = TokenResource.generate(secret, payload, { expires });
        const save = await model.create({
          token,
          payload,
          expires,
        });
        return { save };
      },
    });
  }

}

module.exports = TokenResource;
