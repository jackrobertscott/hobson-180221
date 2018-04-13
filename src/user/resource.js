const Resource = require('../resource');
const {
  login,
  register,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
} = require('./defaults');

module.exports = class UserResource extends Resource {

  /**
   * Add the user endpoints.
   */
  extensions(options) {
    this.add({
      id: 'login',
      path: '/login',
      method: 'post',
      open: true,
      handler: login(options),
    });
    this.add({
      id: 'register',
      path: '/register',
      method: 'post',
      open: true,
      handler: register(options),
    });
    this.add({
      id: 'logout',
      path: '/logout',
      method: 'get',
      open: true,
      handler: logout(options),
    });
    this.add({
      id: 'changePassword',
      path: '/password/change',
      method: 'post',
      handler: changePassword(options),
    });
    this.add({
      id: 'forgotPassword',
      path: '/password/forgot',
      method: 'post',
      handler: forgotPassword(options),
    });
    this.add({
      id: 'resetPassword',
      path: '/password/reset',
      method: 'post',
      handler: resetPassword(options),
    });
  }

};
