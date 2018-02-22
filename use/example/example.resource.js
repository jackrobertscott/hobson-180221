const { Resource } = require('../../src/index');
const exampleModel = require('./example.model');

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

const example = new Resource('example', exampleModel, {
  endpoints,
});

example.addMiddleware('smackTalk', () => {
  throw new Error('ZOO WEE MAMA!');
});

module.exports = example;
