require('dotenv').config();

const { expect } = require('chai');
const request = require('supertest');
const HTTPStatus = require('http-status');
const { attach } = require('../lib/index');
const app = require('../use/app')();
const exampleResource = require('../use/example/example.resource');
const Example = require('../use/example/example.model');

const server = request(app);
const secret = 'ajsdgfadfakjsdhfkjk';
const resources = [exampleResource];
attach({ app, secret, resources });

describe('Standard resource', () => {

  let examples;

  before(async () => {
    await Example.remove({});
    const tasks = [{
      title: 'Example title one.',
      comments: 5,
    }, {
      title: 'Example title two.',
      comments: 10,
    }].map(data => Example.create(data));
    examples = await Promise.all(tasks);
  });

  it('should have the correct resource name', () => expect(exampleResource.resourceName).to.equal('example'));
  it('should have the correct address', () => expect(exampleResource.address).to.equal('/examples'));
  it('should have the correct model name', () => expect(exampleResource.name).to.equal('Example'));

  it('should show the correct environment check', () => server.get('/')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.OK)
    .expect(({ body: { data, status, code } }) => {
      expect(status).to.equal('success');
      expect(code).to.equal(HTTPStatus.OK);
      expect(data).to.have.property('environment', 'test');
    }));

  it('should get all examples', () => server.get('/examples')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.OK)
    .expect(({ body: { data, status, code } }) => {
      expect(status).to.equal('success');
      expect(code).to.equal(HTTPStatus.OK);
      expect(data.examples).to.have.lengthOf(2);
    }));

  it('should limit examples', () => server.get('/examples?limit=1')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.OK)
    .expect(({ body: { data, status, code } }) => {
      expect(status).to.equal('success');
      expect(code).to.equal(HTTPStatus.OK);
      expect(data.examples).to.have.lengthOf(1);
    }));

  it('should sort examples by comments', () => server.get('/examples?sort[comments]=asc')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.OK)
    .expect(({ body: { data, status, code } }) => {
      expect(status).to.equal('success');
      expect(code).to.equal(HTTPStatus.OK);
      expect(data.examples).to.have.lengthOf(2);
      expect(data.examples[0]).to.have.property('comments', 5);
    }));

  it('should skip examples', () => server.get('/examples?sort[comments]=asc&skip=1')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.OK)
    .expect(({ body: { data, status, code } }) => {
      expect(status).to.equal('success');
      expect(code).to.equal(HTTPStatus.OK);
      expect(data.examples).to.have.lengthOf(1);
      expect(data.examples[0]).to.have.property('comments', 10);
    }));

  it('should filter examples', () => server.get('/examples?filter[comments]=10')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.OK)
    .expect(({ body: { data, status, code } }) => {
      expect(status).to.equal('success');
      expect(code).to.equal(HTTPStatus.OK);
      expect(data.examples).to.have.lengthOf(1);
    }));

  it('should count number of examples', () => server.get('/examples/count')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.OK)
    .expect(({ body: { data, status, code } }) => {
      expect(status).to.equal('success');
      expect(code).to.equal(HTTPStatus.OK);
      expect(data).to.have.property('count', 2);
    }));

  it('should count number of examples', () => server.get('/examples/count?filter[comments]=10')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.OK)
    .expect(({ body: { data, status, code } }) => {
      expect(status).to.equal('success');
      expect(code).to.equal(HTTPStatus.OK);
      expect(data).to.have.property('count', 1);
    }));

  it('should get one example', () => server.get('/examples/one')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.OK)
    .expect(({ body: { data, status, code } }) => {
      expect(status).to.equal('success');
      expect(code).to.equal(HTTPStatus.OK);
      expect(data.example).to.have.property('title');
    }));

  it('should get the right example', () => server.get('/examples/one?filter[comments]=10')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.OK)
    .expect(({ body: { data, status, code } }) => {
      expect(status).to.equal('success');
      expect(code).to.equal(HTTPStatus.OK);
      expect(data.example).to.have.property('title', 'Example title two.');
    }));

  it('should get one example', () => server.get(`/examples/${String(examples[0].id)}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.OK)
    .expect(({ body: { data, status, code } }) => {
      expect(status).to.equal('success');
      expect(code).to.equal(HTTPStatus.OK);
      expect(data.example).to.have.property('comments', 5);
      expect(data.example).to.have.property('title');
    }));

  it('should get and select properties from one example', () => server.get(`/examples/${String(examples[0].id)}?select=comments`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.OK)
    .expect(({ body: { data, status, code } }) => {
      expect(status).to.equal('success');
      expect(code).to.equal(HTTPStatus.OK);
      expect(data.example).to.have.property('comments', 5);
      expect(data.example).to.not.have.property('title');
    }));

  it('should create an example', () => server.post('/examples')
    .set('Accept', 'application/json')
    .send({
      title: 'Hello title',
      comments: 15,
    })
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.OK)
    .expect(({ body: { data, status, code } }) => {
      expect(status).to.equal('success');
      expect(code).to.equal(HTTPStatus.OK);
      expect(data.example).to.have.property('comments', 15);
    }));

  it('should fail because the data is not valid', () => server.post('/examples')
    .set('Accept', 'application/json')
    .send({})
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.BAD_REQUEST)
    .expect(({ body: { data, status, code } }) => {
      expect(status).to.equal('fail');
      expect(code).to.equal(HTTPStatus.BAD_REQUEST);
      expect(data.title).to.have.property('kind', 'required');
    }));

  it('should update an example', () => server.patch(`/examples/${String(examples[0].id)}`)
    .set('Accept', 'application/json')
    .send({
      comments: 25,
    })
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.OK)
    .expect(({ body: { data, status, code } }) => {
      expect(status).to.equal('success');
      expect(code).to.equal(HTTPStatus.OK);
      expect(data.example).to.have.property('comments', 25);
    }));

  it('should delete an example', () => server.delete(`/examples/${String(examples[1].id)}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.OK)
    .expect(({ body: { data, status, code } }) => {
      expect(status).to.equal('success');
      expect(code).to.equal(HTTPStatus.OK);
      expect(data.example).to.equal(null);
    })
    .then(async () => {
      const count = await Example.count({ deleted: false });
      expect(count).to.equal(2);
    }));

  it('should order the resource endpoints correctly', () => server.get('/examples/smacktalk')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(HTTPStatus.OK)
    .expect(({ body: { data, status, code } }) => {
      expect(status).to.equal('success');
      expect(code).to.equal(HTTPStatus.OK);
      expect(data.attach).to.equal('hello');
    }));

});
