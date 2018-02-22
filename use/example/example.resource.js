const Resource = require('../../src/index');
const schema = require('./example.schema');

const endpoints = new Map();

endpoints.set('smackTalk', {
  path: '/smack/talk',
  method: 'get',
  handler: async () => ({
    talk: [
      'Yo mama!',
      'I eat robots like you for breakfast!',
      'Rap rap rap. Word.',
      'Get wrecked. Ship wrecked.',
      'Hello! You smell.',
    ][Math.floor(Math.random() * 5)],
  }),
});

const example = new Resource('example', schema, {
  endpoints,
  disable: [{
    id: 'findOne',
    localise: true,
  }, 'remove'],
});

example.addMiddleware('find', async () => {
  throw new Error('ZOO WEE MAMA!');
});

module.exports = example;
