const { expect } = require('../utils/helpers');
const errors = require('../errors');

/**
 * Login a user with the provided credentials.
 */
module.exports.login = function login({ secret } = {}) {
  expect({ name: 'secret', value: secret, type: 'string' });
  return async ({ Model, body: { email, password } }) => {
    const user = await Model.findOne({ email: { $regex: new RegExp(email, 'i') } }).select('password');
    if (!user) {
      throw new errors.NotFoundResponse({ message: 'No user was found for the given email.' });
    }
    const match = await user.comparePassword(password);
    if (!match) {
      throw new errors.BadResponse({ message: 'Password is incorrect.' });
    }
    const auth = await user.tokenize({ secret });
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
module.exports.register = function register({ secret } = {}) {
  expect({ name: 'secret', value: secret, type: 'string' });
  return async ({ Model, body }) => {
    const existing = await Model.findOne({ email: { $regex: new RegExp(body.email, 'i') } });
    if (existing) {
      throw new errors.BadResponse({ message: 'User already exists with this email.' });
    }
    const user = await Model.create(body);
    if (!user) {
      throw new errors.BreakingResponse({ message: 'Error occurred while creating user.' });
    }
    const auth = await user.tokenize({ secret });
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
    if (!newPassword) {
      throw new errors.BadResponse({
        message: 'There was an error changing password.',
        data: {
          newPassword: { message: 'The new password field is required.' },
        },
      });
    }
    const patch = await Model.findById(user.id).select('password');
    if (patch && patch.password) {
      if (!oldPassword) {
        throw new errors.BadResponse({
          message: 'There was an error changing password.',
          data: {
            newPassword: { message: 'The old password field is required.' },
          },
        });
      }
      const match = await patch.comparePassword(oldPassword);
      if (!match) {
        throw new errors.BadResponse({ message: 'Current password is incorrect.' });
      }
    }
    await Object.assign(patch, { password: newPassword }).save();
    delete patch.password;
    return { user: patch };
  };
};

/**
 * Request that a user's password needs to be updated.
 */
module.exports.forgotPassword = function forgotPassword({ secret } = {}) {
  expect({ name: 'secret', value: secret, type: 'string' });
  return async ({ Model, body: { email }, context }) => {
    if (!email) {
      throw new errors.BadResponse({
        message: 'There was an error requesting a new password.',
        data: {
          email: { message: 'The email field is required.' },
        },
      });
    }
    const user = await Model.findOne({ email: { $regex: new RegExp(email, 'i') } });
    if (!user) {
      throw new errors.BadResponse({ message: `No accounts match the email address: ${email}.` });
    }
    const auth = await user.tokenize({ secret, options: { expiresIn: '1h' } });
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
      const data = {};
      if (!email) data.email = { message: 'The email field is required.' };
      if (!newPassword) data.newPassword = { message: 'The new password field is required.' };
      throw new errors.BadResponse({ message: 'There was an error resetting password.', data });
    }
    const user = await Model.findOne({ email: { $regex: new RegExp(email, 'i') } }).select('password');
    if (!user) {
      throw new errors.BadResponse({ message: `No accounts match the email address: ${email}.` });
    }
    if (auth.payload.userId !== user.id) {
      throw new errors.BadResponse({ message: `The token does not match the email provided: ${email}.` });
    }
    await Object.assign(user, { password: newPassword }).save();
    return {}; // nothing to return...
  };
};
