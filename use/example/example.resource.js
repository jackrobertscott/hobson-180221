const Resource = require('../../src/index');
const schema = require('./example.schema');

const endpoints = new Map();

endpoints.set('smacktalk', {
  path: '/smack/talk',
  method: 'get',
  handler: async () => ({ talk: 'Yo mama!' }),
  activate: [
    async () => {
      // throw new Error('Lalalala');
    },
  ],
});

module.exports = new Resource('example', schema, { endpoints });
