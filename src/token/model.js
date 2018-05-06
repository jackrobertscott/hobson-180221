const TokenSchema = require('./schema');

const tokenSchema = new TokenSchema({});

module.exports = tokenSchema.compile('Token');
