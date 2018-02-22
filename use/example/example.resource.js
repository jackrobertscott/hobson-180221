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
  disable: ['remove'],
});

example.addMiddleware('smackTalk', () => {
  throw new Error('ZOO WEE MAMA!');
});

example.addEndpoint('niceTalk', {
  path: '/nice/talk',
  method: 'get',
  handler: async () => ({
    talk: [
      'You look nice today.',
      'Would you like some tea?',
      'I really respect you.',
      'Good work, fine sir!',
      'Hello! You smell nice.',
    ][Math.floor(Math.random() * 5)],
  }),
});

module.exports = example;
