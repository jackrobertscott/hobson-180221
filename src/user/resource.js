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
  defaults() {
    super.defaults();
    this.add({
      id: 'login',
      path: '/login',
      method: 'post',
      open: true,
      handler: (...args) => login(this.options)(...args),
    });
    this.add({
      id: 'register',
      path: '/register',
      method: 'post',
      open: true,
      handler: (...args) => register(this.options)(...args),
    });
    this.add({
      id: 'logout',
      path: '/logout',
      method: 'get',
      open: true,
      handler: (...args) => logout(this.options)(...args),
    });
    this.add({
      id: 'changePassword',
      path: '/password/change',
      method: 'post',
      handler: (...args) => changePassword(this.options)(...args),
    });
    this.add({
      id: 'forgotPassword',
      path: '/password/forgot',
      method: 'post',
      handler: (...args) => forgotPassword(this.options)(...args),
    });
    this.add({
      id: 'resetPassword',
      path: '/password/reset',
      method: 'post',
      handler: (...args) => resetPassword(this.options)(...args),
    });
  }

};
