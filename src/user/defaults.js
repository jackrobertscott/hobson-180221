const HTTPStatus = require('http-status');
const { expect } = require('../utils/helpers');
const errors = require('../errors');
const { createUserToken } = require('../utils/auth');

/**
 * Login a user with the provided credentials.
 */
module.exports.login = function login({ Token, secret } = {}) {
  expect({ name: 'secret', value: secret, type: 'string' });
  if (!Token) {
    throw new errors.Response({ message: 'Parameters missing to login function; needs token model' });
  }
  return async ({ Model, body: { email, password } }) => {
    const user = await Model.findOne({ email: { $regex: new RegExp(email, 'i') } }).select('password');
    if (!user) {
      throw new errors.Response({
        message: 'No user was found for the given email.',
        status: HTTPStatus.NOT_FOUND,
      });
    }
    const match = await user.comparePassword(password);
    if (!match) {
      throw new errors.Response({
        message: 'Password is incorrect.',
        status: HTTPStatus.BAD_REQUEST,
      });
    }
    const auth = await createUserToken({ Token, user, secret });
    const { payload = {} } = auth;
    return {
      auth: {
        token: auth.token,
        ...payload,
      },
    };
  };
};

/**
 * Register (sign up) a new user.
 */
module.exports.register = function register({ Token, secret } = {}) {
  expect({ name: 'secret', value: secret, type: 'string' });
  if (!Token) {
    throw new errors.Response({ message: 'Parameters missing to register function; needs token model.' });
  }
  return async ({ Model, body }) => {
    const existing = await Model.findOne({ email: { $regex: new RegExp(body.email, 'i') } });
    if (existing) {
      throw new errors.Response({
        message: 'User already exists with this email.',
        status: HTTPStatus.NOT_FOUND,
      });
    }
    const user = await Model.create(body);
    if (!user) {
      throw new errors.Response({ message: 'Error occurred while creating user.' });
    }
    const auth = await createUserToken({ Token, user, secret });
    const { payload = {} } = auth;
    return {
      user,
      auth: {
        token: auth.token,
        ...payload,
      },
    };
  };
};

/**
 * Logout a user from the application.
 */
module.exports.logout = function logout() {
  return async ({ auth }) => {
    if (auth) {
      await Object.assign(auth, { active: false }).save();
    }
    return { auth: null };
  };
};

/**
 * Change a user's password.
 */
module.exports.changePassword = function changePassword() {
  return async ({ Model, body: { oldPassword, newPassword }, user }) => {
    if (!oldPassword || !newPassword) {
      const error = new errors.Response({
        message: 'There was an error changing password.',
        status: HTTPStatus.BAD_REQUEST,
        data: {},
      });
      if (!oldPassword) error.data.oldPassword = { message: 'The old password field is required.' };
      if (!newPassword) error.data.newPassword = { message: 'The new password field is required.' };
      throw error;
    }
    const patch = await Model.findById(user.id).select('password');
    const match = await patch.comparePassword(oldPassword);
    if (!match) {
      throw new errors.Response({
        message: 'Current password is incorrect.',
        status: HTTPStatus.BAD_REQUEST,
      });
    }
    await Object.assign(patch, { password: newPassword }).save();
    delete patch.password;
    return { user: patch };
  };
};

/**
 * Request that a user's password needs to be updated.
 */
module.exports.forgotPassword = function forgotPassword({ Token, secret } = {}) {
  expect({ name: 'secret', value: secret, type: 'string' });
  if (!Token) {
    throw new errors.Response({ message: 'Parameters missing to forgotPassword function; needs token model.' });
  }
  return async ({ Model, body: { email }, context }) => {
    if (!email) {
      throw new errors.Response({
        message: 'There was an error requesting a new password.',
        status: HTTPStatus.BAD_REQUEST,
        data: {
          email: { message: 'The email field is required.' },
        },
      });
    }
    const user = await Model.findOne({ email: { $regex: new RegExp(email, 'i') } });
    if (!user) {
      throw new errors.Response({
        message: `No accounts match the email address: ${email}.`,
        status: HTTPStatus.BAD_REQUEST,
      });
    }
    const auth = await createUserToken({ Token, user, secret, options: { expiresIn: '1h' } });
    Object.assign(context, { auth });
    return {}; // nothing to return...
  };
};

/**
 * Change a user's password.
 */
module.exports.resetPassword = function resetPassword() {
  return async ({ Model, auth, body: { email, newPassword } }) => {
    if (!email || !newPassword) {
      const error = new errors.Response({
        message: 'There was an error resetting password.',
        status: HTTPStatus.BAD_REQUEST,
        data: {},
      });
      if (!email) error.data.email = { message: 'The email field is required.' };
      if (!newPassword) error.data.newPassword = { message: 'The new password field is required.' };
      throw error;
    }
    const user = await Model.findOne({ email: { $regex: new RegExp(email, 'i') } }).select('password');
    if (!user) {
      throw new errors.Response({
        message: `No accounts match the email address: ${email}.`,
        status: HTTPStatus.BAD_REQUEST,
      });
    }
    if (auth.payload.userId !== user.id) {
      throw new errors.Response({
        message: `The token does not match the email provided: ${email}.`,
        status: HTTPStatus.BAD_REQUEST,
      });
    }
    await Object.assign(user, { password: newPassword }).save();
    return {}; // nothing to return...
  };
};
