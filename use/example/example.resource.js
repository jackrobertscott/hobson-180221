const Resource = require('../../src/index');
const schema = require('./example.schema');

module.exports = new Resource('example', schema);
