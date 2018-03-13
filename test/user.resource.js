require('dotenv').config();

const { expect } = require('chai');
const request = require('supertest');
const HTTPStatus = require('http-status');
const mongoose = require('mongoose');
const { connect } = require('../lib/index');
const faker = require('faker');
const app = require('../use/app')();
const { createToken } = require('../src/utils/user');
const userResource = require('../use/user/user.resource');

const secret = 'ajsdgfadfakjsdhfkjk';
connect({
  app,
  resources: [userResource],
  secret,
});
const User = userResource.model;
const server = request(app);

describe('User resource', () => {

  let users;
  let password;
  let userToken;

  before(async () => {
    await User.remove({});
    password = faker.internet.password();
    const tasks = [{
      email: faker.internet.email(),
      password,
    }, {
      email: faker.internet.email(),
      password: faker.internet.password(),
    }].map(data => User.create(data));
    users = await Promise.all(tasks);
    const auth = await createToken({
      Token: mongoose.model('Token'),
      user: users[0],
      secret,
    });
    userToken = auth.token;
  });

  it('should have the correct resource name', () => expect(userResource.resourceName).to.equal('user'));
  it('should have the correct address', () => expect(userResource.address).to.equal('/users'));
  it('should have the correct model name', () => expect(userResource.name).to.equal('User'));

  it('should fail getting all users', () => server.get('/users')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.UNAUTHORIZED));

  it('should fail getting one user', () => server.get(`/users/${String(users[0].id)}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.UNAUTHORIZED));

  it('should fail to update a user', () => server.patch(`/users/${String(users[0].id)}`)
    .set('Accept', 'application/json')
    .send({})
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.UNAUTHORIZED));

  it('should fail to delete a user', () => server.delete(`/users/${String(users[1].id)}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.UNAUTHORIZED));

  it('should register a new user', () => server.post('/users/register')
    .set('Accept', 'application/json')
    .send({
      email: faker.internet.email(),
      password: faker.internet.password(),
    })
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.OK)
    .expect(({ body: { data, status, code } }) => {
      expect(status).to.equal('success');
      expect(code).to.equal(HTTPStatus.OK);
      expect(data.user).to.have.property('email');
      expect(data.auth).to.have.property('token');
    }));

  it('should fail to register with missing credentials', () => server.post('/users/register')
    .set('Accept', 'application/json')
    .send({
      email: faker.internet.email(),
    })
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.BAD_REQUEST)
    .expect(({ body: { data, status, code } }) => {
      expect(status).to.equal('fail');
      expect(code).to.equal(HTTPStatus.BAD_REQUEST);
      expect(data).to.have.property('password');
    }));

  it('should login a user', () => server.post('/users/login')
    .set('Accept', 'application/json')
    .send({
      email: users[0].email,
      password,
    })
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.OK)
    .expect(({ body: { data, status, code } }) => {
      expect(status).to.equal('success');
      expect(code).to.equal(HTTPStatus.OK);
      expect(data.auth).to.have.property('token');
    }));

  it('should fail for unauthenticated requests', () => server.get('/users/check')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(({ body: { status, code } }) => {
      expect(status).to.equal('fail');
      expect(code).to.equal(HTTPStatus.UNAUTHORIZED);
    }));

  it('should correctly authenticate a user', () => server.get('/users/check')
    .set('Accept', 'application/json')
    .set('Authorization', userToken)
    .expect('Content-Type', /json/)
    .expect(({ body: { status, code, data } }) => {
      expect(status).to.equal('success');
      expect(code).to.equal(HTTPStatus.OK);
      expect(data).to.have.property('working', true);
    }));

  it('should fail if a users email is incorrect', () => server.post('/users/login')
    .set('Accept', 'application/json')
    .send({
      email: 'random.email@example.com',
      password,
    })
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.NOT_FOUND)
    .expect(({ body: { message, status, code } }) => {
      expect(status).to.equal('fail');
      expect(code).to.equal(HTTPStatus.NOT_FOUND);
      expect(message).to.equal('No user was found for the given email.');
    }));

  it('should fail a login on bad credentials', () => server.post('/users/login')
    .set('Accept', 'application/json')
    .send({
      email: users[0].email,
      password: 'wrong password',
    })
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.BAD_REQUEST)
    .expect(({ body: { message, status, code } }) => {
      expect(status).to.equal('fail');
      expect(code).to.equal(HTTPStatus.BAD_REQUEST);
      expect(message).to.equal('Password is incorrect.');
    }));

});
