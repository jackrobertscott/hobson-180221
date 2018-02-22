const Resource = require('./resource');

class UserResource extends Resource {

  get defaults() {
    return super.defaults
      .set('login', {
        path: '/action/login',
        method: 'get',
        handler: async () => ({ login: false }),
        activate: [],
      });
  }

}

module.exports = UserResource;
