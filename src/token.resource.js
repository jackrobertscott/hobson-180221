const Resource = require('./resource');

class TokenResource extends Resource {

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
      expiry: {
        type: Number,
        required: true,
      },
    });
  }

}

module.exports = TokenResource;
