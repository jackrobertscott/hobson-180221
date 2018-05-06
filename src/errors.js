const HTTPStatus = require('http-status');
const { expect } = require('./utils/helpers');

function digest({ message, status = HTTPStatus.INTERNAL_SERVER_ERROR, data } = {}) {
  expect({ name: 'message', value: message, type: 'string' });
  expect({ name: 'status', value: status, type: 'number' });
  expect({ name: 'data', value: data, type: 'object', optional: true });
  let code;
  if (status >= 500 && status < 600) {
    code = 'error';
  } else if (status >= 400 && status < 500) {
    code = 'fail';
  } else {
    throw new Error(`Expected "status" parameter to be a number between 400 and 600 but got ${status}.`);
  }
  return { message, status, code, data };
}

module.exports.Response = class Response extends Error {

  constructor(args = {}) {
    const { message, status, code, data } = digest(args);
    super(message);
    this.status = status;
    this.code = code;
    if (data) {
      this.data = data;
    }
    Error.captureStackTrace(this, Response);
  }

};

module.exports.BadResponse = class BadResponse extends Error {

  constructor(args = {}) {
    const { message, status, code, data } = digest({ ...args, status: HTTPStatus.BAD_REQUEST });
    super(message);
    this.status = status;
    this.code = code;
    if (data) {
      this.data = data;
    }
    Error.captureStackTrace(this, BadResponse);
  }

};

module.exports.BreakingResponse = class BreakingResponse extends Error {

  constructor(args = {}) {
    const { message, status, code, data } = digest({ ...args, status: HTTPStatus.INTERNAL_SERVER_ERROR });
    super(message);
    this.status = status;
    this.code = code;
    if (data) {
      this.data = data;
    }
    Error.captureStackTrace(this, BreakingResponse);
  }

};

module.exports.NotFoundResponse = class NotFoundResponse extends Error {

  constructor(args = {}) {
    const { message, status, code, data } = digest({ ...args, status: HTTPStatus.NOT_FOUND });
    super(message);
    this.status = status;
    this.code = code;
    if (data) {
      this.data = data;
    }
    Error.captureStackTrace(this, NotFoundResponse);
  }

};

module.exports.UnauthResponse = class UnauthResponse extends Error {

  constructor(args = {}) {
    const { message, status, code, data } = digest({ ...args, status: HTTPStatus.UNAUTHORIZED });
    super(message);
    this.status = status;
    this.code = code;
    if (data) {
      this.data = data;
    }
    Error.captureStackTrace(this, UnauthResponse);
  }

};
