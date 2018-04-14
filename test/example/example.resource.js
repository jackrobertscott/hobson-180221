const { Resource, Route, Permission } = require('../../lib/index');
const Example = require('./example.model');

const example = new Resource({ model: Example });

/**
 * Testing creation of endpoints *without* defining a route instance.
 */
example.add({
  id: 'smackTalk',
  path: '/smacktalk',
  method: 'get',
  open: true,
  handler: async () => ({
    talk: [
      'Yo mama!',
      'I eat robots like you for breakfast!',
      'Rap rap rap. Word.',
      'Get wrecked. Ship wrecked.',
      'Hello! You smell.',
    ][Math.floor(Math.random() * 5)],
  }),
});
example.get('smackTalk').after(({ data }) => Object.assign(data, { attach: 'hello' }));

/**
 * Testing creation of endpoints *with* defining a route instance.
 */
const niceTalk = new Route({
  id: 'niceTalk',
  path: '/:nice/talk',
  method: 'get',
  open: true,
  handler: async () => ({
    talk: [
      'You look nice today.',
      'Would you like some tea?',
      'I really respect you.',
      'Good work, fine sir!',
      'Hello! You smell nice.',
    ][Math.floor(Math.random() * 5)],
  }),
});
example.add(niceTalk);

/**
 * Testing creation of endpoints *with* defining a route instance.
 */
const orderSort = new Route({
  id: 'orderSort',
  path: '/order',
  method: 'get',
  open: true,
  handler: () => ({ hello: true }),
});
example.add(orderSort);

/**
 * Testing middleware works.
 */
example.get('find').middleware((req, res, next) => {
  // testing code here...
  next();
});

/**
 * Permissions
 */
example.get('find').access(Permission.isAnyone());
example.get('count').access(Permission.isAnyone());
example.get('findOne').access(Permission.isAnyone());
example.get('findById').access(Permission.isAnyone());
example.get('create').access(Permission.isAnyone());
example.get('update').access(Permission.isAnyone());
example.get('remove').access(Permission.isAnyone());

/**
 * Hooks
 */
example.get('find')
  .after(({ context }) => {
    if (context.messageOne !== 'Jack is awesome' || context.messageTwo !== 'Jack is cool') {
      throw new Error('This will not be called as my function is baller af.');
    }
  })
  .before(({ context }) => {
    Object.assign(context, { messageOne: 'Jack is awesome' });
  })
  .before(({ context }) => {
    Object.assign(context, { messageTwo: 'Jack is cool' });
  });

module.exports = example;
