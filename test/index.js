require('dotenv').config();

const { expect } = require('chai');
const request = require('supertest');
const app = require('../use/app');
const exampleResource = require('../use/example/example.resource');

exampleResource.attach(app);
const Example = exampleResource.model;
const server = request(app);

describe('Standard routes', () => {

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
    const items = await Promise.all(tasks);
    examples = items;
  });

  it('should have the correct resource name', () => expect(exampleResource.resourceName).to.equal('example'));
  it('should have the correct address', () => expect(exampleResource.address).to.equal('/examples'));
  it('should have the correct model name', () => expect(exampleResource.modelName).to.equal('Example'));

  it('should get all examples', () => server.get('/examples')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(({ body: { data } }) => expect(data.examples).to.have.lengthOf(2)));

  it('should get one example', () => server.get(`/examples/${String(examples[0].id)}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(({ body: { data } }) => expect(data.example).to.have.property('comments', 5)));

  it('should create an example', () => server.post('/examples')
    .set('Accept', 'application/json')
    .send({
      title: 'Hello title',
      comments: 15,
    })
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(({ body: { data } }) => expect(data.example).to.have.property('comments', 15)));

  it('should fail because the data is not valid', () => server.post('/examples')
    .set('Accept', 'application/json')
    .send({})
    .expect('Content-Type', /json/)
    .expect(400)
    .expect(({ body: { data } }) => expect(data.title).to.have.property('kind', 'required')));

  it('should update an example', () => server.patch(`/examples/${String(examples[0].id)}`)
    .set('Accept', 'application/json')
    .send({
      comments: 25,
    })
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(({ body: { data } }) => expect(data.example).to.have.property('comments', 25)));

  it('should get delete an example', () => server.delete(`/examples/${String(examples[1].id)}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(({ body: { data } }) => expect(data.example).to.equal(null))
    .then(async () => {
      const count = await Example.count({});
      expect(count).to.equal(2);
    }));

  it('should get all examples', () => server.get('/examples/smack/talk')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(({ body: { data } }) => expect(data.attach).to.equal('hello')));

});
