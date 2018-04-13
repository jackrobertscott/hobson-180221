const hobson = require('hobson');

/**
 * Step 1: Schema
 * - Set the structure of the schema
 * - Set some custom options
 * - Set virtuals, methods, and all the other good stuff..
 */
const structure = {
  title: {
    type: String,
    required: true,
  },
};
const options = {
  timestamps: true,
};
const ExampleSchema = hobson.schema({ structure, options });
// a regular mongoose schema (with some goodies); use virtuals, methods, and more...

/**
 * Step 2: Model
 * - Register the schema with mongoose and the database
 * - Use this in other resource files
 */
const Example = hobson.model({ name: 'Example', schema: ExampleSchema });
// a regular mongoose model with findById, findOne, etc.

/**
 * Step 3: Resource (optional)
 * - Create a resource with a bunch of endpoints
 * - Configure the endpoints so they just right
 * - Provide permissions and hooks
 */
const ExampleResource = hobson.resource({ name: 'example', model: Example });

const orderSort = ExampleResource.route({
  id: 'orderSort',
  path: '/order',
  method: 'get',
  open: true,
  handler: () => ({ hello: true }),
});

orderSort
  .permission(hobson.access.isUser()) // permission
  .before(() => console.log('hello')) // before hook
  .after(() => console.log('lalalala')); // after hook

const findOne = ExampleResource.route('findOne')
  .permission(hobson.access.isUser());

findOne.before(() => console.log('hello'));

/**
 * Step 4: Routes
 * - Routes are seperate to the resource but can be added to give functionality
 */
const exampleFindRoute = hobson.route({
  id: 'orderSort',
  path: '/order',
  method: 'get',
  open: true,
  handler: () => ({ hello: true }),
});

exampleFindRoute.before(() => console.log('hello'));

ExampleResource.add(exampleFindRoute);

/**
 * Step 5: Connect
 * - Connect routes to the app
 * - Under the hood, hobson keeps track of all resources and knows what's going on.
 */
hobson.connect({ app });
