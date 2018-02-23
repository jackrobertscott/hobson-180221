const { Resource } = require('../../lib/index');
const exampleSchema = require('./example.schema');

const example = new Resource({
  name: 'example',
  schema: exampleSchema,
  options: {
    timestamps: true,
  },
});

/**
 * Endpoints
 */
example
  .addEndpoint('smackTalk', {
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
    permissions: [
      () => true,
    ],
    postHooks: [
      ({ data }) => Object.assign(data, { attach: 'hello' }),
    ],
  })
  .addEndpoint('niceTalk', {
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
    permissions: [
      () => true,
    ],
  });

/**
 * Middleware (old express middleware)
 */
example
  .addMiddleware('find', (req, res, next) => {
    // console.log('middleware called');
    next();
  });

/**
 * Permissions
 */
example
  .addPermission('find', () => true)
  .addPermission('findOne', () => true)
  .addPermission('create', () => true)
  .addPermission('update', () => true)
  .addPermission('remove', () => true);

/**
 * Hooks
 */
example
  .addPostHook('find', ({ context }) => {
    if (context.messageOne !== 'Jack is awesome' || context.messageTwo !== 'Jack is cool') {
      throw new Error('This will not be called as my function is baller af.');
    }
  })
  .addPreHook('find', ({ context }) => {
    Object.assign(context, { messageOne: 'Jack is awesome' });
  })
  .addPreHook('find', ({ context }) => {
    Object.assign(context, { messageTwo: 'Jack is cool' });
  });

module.exports = example.compile();
