const Resource = require('../../src/index');
const schema = require('./example.schema');

const endpoints = new Map();

endpoints.set('smacktalk', {
  path: '/smack/talk',
  method: 'get',
  handler: async () => ({ talk: ['Yo mama!', 'Have 5 entries, or what!', 'Mwahahah word.', 'Blah', 'Hello! Smelly.'][Math.floor(Math.random() * 5)] }),
});

module.exports = new Resource('example', schema, { endpoints }, ['findOne']);
