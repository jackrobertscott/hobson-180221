const request = require('supertest');
const { attach } = require('../lib/index');
const app = require('./app')();
const exampleResource = require('./example/example.resource');
const userResource = require('./user/user.resource');

const server = request(app);
const secret = 'ajsdgfadfakjsdhfkjk';
const resources = [
  exampleResource,
  userResource,
];
attach({ app, secret, resources });

module.exports = {
  server,
  secret,
  resources,
};
