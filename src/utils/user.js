const HTTPStatus = require('http-status');
const { authPackage } = require('./auth');
const { checkString } = require('./helpers');
const { ResponseError } = require('./errors');

/**
 * Create and save a token with a user.
 */
async function createToken({ Token, user, secret, options } = {}) {
  const item = new Token({});
  const pack = authPackage({
    id: item.id,
    userId: user.id,
    email: user.email,
  }, secret, options);
  return Object.assign(item, pack).save();
}
module.exports.createToken = createToken;

/**
 * Login a user with the provided credentials.
 */
function login({ Token, secret } = {}) {
  checkString(secret, { method: 'login' });
  if (!Token) {
    throw new ResponseError({ message: 'Parameters missing to login function; needs token model' });
  }
  return async ({ Model, body: { email, password } }) => {
    const user = await Model.findOne({ email: { $regex: new RegExp(email, 'i') } }).select('password');
    if (!user) {
      throw new ResponseError({
        message: 'No user was found for the given email.',
        code: HTTPStatus.NOT_FOUND,
      });
    }
    const match = await user.comparePassword(password);
    if (!match) {
      throw new ResponseError({
        message: 'Password is incorrect.',
        code: HTTPStatus.BAD_REQUEST,
      });
    }
    const auth = await createToken({ Token, user, secret });
    return {
      auth: {
        token: auth.token,
        ...auth.payload,
      },
    };
  };
}
module.exports.login = login;

/**
 * Register (sign up) a new user.
 */
function register({ Token, secret } = {}) {
  checkString(secret, { method: 'register' });
  if (!Token) {
    throw new ResponseError({ message: 'Parameters missing to register function; needs token model.' });
  }
  return async ({ Model, body }) => {
    const existing = await Model.findOne({ email: { $regex: new RegExp(body.email, 'i') } });
    if (existing) {
      throw new ResponseError({
        message: 'User already exists with this email.',
        code: HTTPStatus.NOT_FOUND,
      });
    }
    const user = await Model.create(body);
    if (!user) {
      throw new ResponseError({ message: 'Error occurred while creating user.' });
    }
    const auth = await createToken({ Token, user, secret });
    return {
      user,
      auth: {
        token: auth.token,
        ...auth.payload,
      },
    };
  };
}
module.exports.register = register;

/**
 * Logout a user from the application.
 */
function logout() {
  return async ({ auth }) => {
    if (auth) {
      await Object.assign(auth, { active: false }).save();
    }
    return { auth: null };
  };
}
module.exports.logout = logout;

/**
 * Change a user's password.
 */
function changePassword() {
  return async ({ Model, body: { oldPassword, newPassword }, user }) => {
    if (!oldPassword || !newPassword) {
      const error = new ResponseError({
        message: 'There was an error changing password.',
        code: HTTPStatus.BAD_REQUEST,
        data: {},
      });
      if (!oldPassword) error.data.oldPassword = { message: 'The old password field is required.' };
      if (!newPassword) error.data.newPassword = { message: 'The new password field is required.' };
      throw error;
    }
    const patch = await Model.findById(user.id).select('password');
    const match = await patch.comparePassword(oldPassword);
    if (!match) {
      throw new ResponseError({
        message: 'Current password is incorrect.',
        code: HTTPStatus.BAD_REQUEST,
      });
    }
    await Object.assign(patch, { password: newPassword }).save();
    delete patch.password;
    return { user: patch };
  };
}
module.exports.changePassword = changePassword;

/**
 * Request that a user's password needs to be updated.
 */
function forgotPassword({ Token, secret } = {}) {
  checkString(secret, { method: 'forgotPassword' });
  if (!Token) {
    throw new ResponseError({ message: 'Parameters missing to forgotPassword function; needs token model.' });
  }
  return async ({ Model, body: { email }, context }) => {
    if (!email) {
      throw new ResponseError({
        message: 'There was an error requesting a new password.',
        code: HTTPStatus.BAD_REQUEST,
        data: {
          email: { message: 'The email field is required.' },
        },
      });
    }
    const user = await Model.findOne({ email: { $regex: new RegExp(email, 'i') } });
    if (!user) {
      throw new ResponseError({
        message: `No accounts match the email address: ${email}.`,
        code: HTTPStatus.BAD_REQUEST,
      });
    }
    const auth = await createToken({ Token, user, secret, options: { expiresIn: '1h' } });
    Object.assign(context, { auth });
    return {}; // nothing to return...
  };
}
module.exports.forgotPassword = forgotPassword;

/**
 * Change a user's password.
 */
function resetPassword() {
  return async ({ Model, auth, body: { email, newPassword } }) => {
    if (!email || !newPassword) {
      const error = new ResponseError({
        message: 'There was an error resetting password.',
        code: HTTPStatus.BAD_REQUEST,
        data: {},
      });
      if (!email) error.data.email = { message: 'The email field is required.' };
      if (!newPassword) error.data.newPassword = { message: 'The new password field is required.' };
      throw error;
    }
    const user = await Model.findOne({ email: { $regex: new RegExp(email, 'i') } }).select('password');
    if (!user) {
      throw new ResponseError({
        message: `No accounts match the email address: ${email}.`,
        code: HTTPStatus.BAD_REQUEST,
      });
    }
    if (auth.payload.userId !== user.id) {
      throw new ResponseError({
        message: `The token does not match the email provided: ${email}.`,
        code: HTTPStatus.BAD_REQUEST,
      });
    }
    await Object.assign(user, { password: newPassword }).save();
    return {}; // nothing to return...
  };
}
module.exports.resetPassword = resetPassword;
