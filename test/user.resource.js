require('dotenv').config();

const { expect } = require('chai');
const request = require('supertest');
const HTTPStatus = require('http-status');
const mongoose = require('mongoose');
const faker = require('faker');
const app = require('../use/app')();
const { createUserToken } = require('../lib/utils/auth');
const { attach } = require('../lib/index');
const User = require('../use/user/user.model');
const userResource = require('../use/user/user.resource');

const server = request(app);
const secret = 'ajsdgfadfakjsdhfkjk';
const resources = [userResource];
attach({ app, secret, resources });

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
    const auth = await createUserToken({
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

  it('should getting one user', () => server.get(`/users/${String(users[0].id)}`)
    .set('Accept', 'application/json')
    .set('Authorization', userToken)
    .expect('Content-Type', /json/)
    .expect(({ body: { status, code, data } }) => {
      expect(status).to.equal('success');
      expect(code).to.equal(HTTPStatus.OK);
      expect(data).to.have.property('user');
    }));

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
      expect(data).to.have.property('auth');
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

  it('should fail to change a user password', () => server.post('/users/password/change')
    .set('Accept', 'application/json')
    .set('Authorization', userToken)
    .send({
      oldPassword: 'wrongPassword',
      newPassword: 'coolioMcCool',
    })
    .expect('Content-Type', /json/)
    .expect(({ body: { status, code, message } }) => {
      expect(status).to.equal('fail');
      expect(code).to.equal(HTTPStatus.BAD_REQUEST);
      expect(message).to.equal('Current password is incorrect.');
    }));

  it('should change a user password', () => server.post('/users/password/change')
    .set('Accept', 'application/json')
    .set('Authorization', userToken)
    .send({
      oldPassword: password,
      newPassword: 'coolioMcCool',
    })
    .expect('Content-Type', /json/)
    .expect(({ body: { status, code } }) => {
      expect(status).to.equal('success');
      expect(code).to.equal(HTTPStatus.OK);
      password = 'coolioMcCool'; // update the testing password too
    }));

  it('should fail if an email is not provided', () => server.post('/users/password/forgot')
    .set('Accept', 'application/json')
    .send({})
    .expect('Content-Type', /json/)
    .expect(({ body: { status, code, message } }) => {
      expect(status).to.equal('fail');
      expect(code).to.equal(HTTPStatus.BAD_REQUEST);
      expect(message).to.equal('There was an error requesting a new password.');
    }));

  it('should request a new password', () => server.post('/users/password/forgot')
    .set('Accept', 'application/json')
    .send({ email: users[0].email })
    .expect('Content-Type', /json/)
    .expect(({ body: { status, code, data } }) => {
      expect(status).to.equal('success');
      expect(code).to.equal(HTTPStatus.OK);
      expect(Object.keys(data).length).to.equal(0);
    }));

  it('should fail to reset a password when missing token', () => server.post('/users/password/reset')
    .set('Accept', 'application/json')
    .send({})
    .expect('Content-Type', /json/)
    .expect(({ body: { status, code } }) => {
      expect(status).to.equal('fail');
      expect(code).to.equal(HTTPStatus.UNAUTHORIZED);
    }));

  it('should fail to reset a password when missing new password', () => server.post('/users/password/reset')
    .set('Accept', 'application/json')
    .set('Authorization', userToken)
    .send({ email: users[0].email })
    .expect('Content-Type', /json/)
    .expect(({ body: { status, code, message, data } }) => {
      expect(status).to.equal('fail');
      expect(code).to.equal(HTTPStatus.BAD_REQUEST);
      expect(message).to.equal('There was an error resetting password.');
      expect(data).to.have.property('newPassword');
      expect(data).to.not.have.property('email');
    }));

  it('should fail to reset a password when missing email', () => server.post('/users/password/reset')
    .set('Accept', 'application/json')
    .set('Authorization', userToken)
    .send({ newPassword: 'otherMcKnow' })
    .expect('Content-Type', /json/)
    .expect(({ body: { status, code, message, data } }) => {
      expect(status).to.equal('fail');
      expect(code).to.equal(HTTPStatus.BAD_REQUEST);
      expect(message).to.equal('There was an error resetting password.');
      expect(data).to.have.property('email');
      expect(data).to.not.have.property('newPassword');
    }));

  it('should reset a users password', () => server.post('/users/password/reset')
    .set('Accept', 'application/json')
    .set('Authorization', userToken)
    .send({
      email: users[0].email,
      newPassword: 'someOtherCoolPassword',
    })
    .expect('Content-Type', /json/)
    .expect(({ body: { status, code, data } }) => {
      expect(status).to.equal('success');
      expect(code).to.equal(HTTPStatus.OK);
      expect(Object.keys(data).length).to.equal(0);
    })
    .then(() => User.findOne({ email: users[0].email }).select('password'))
    .then(async checkUser => ({
      newPass: await checkUser.comparePassword('someOtherCoolPassword'),
      oldPass: await checkUser.comparePassword(password),
    }))
    .then(({ newPass, oldPass }) => expect(newPass).to.equal(true) && expect(oldPass).to.equal(false)));

});
