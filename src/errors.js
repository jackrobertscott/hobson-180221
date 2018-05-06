const HTTPStatus = require('http-status');
const { expect } = require('./utils/helpers');

module.exports.Response = class Response extends Error {

  constructor({ message, status = HTTPStatus.INTERNAL_SERVER_ERROR, data } = {}) {
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
    super(message || `Error has occurred with status ${status || 'unknown'}.`);
    this.status = status;
    this.code = code;
    if (data) {
      this.data = data;
    }
    Error.captureStackTrace(this, Response);
  }

};

module.exports.BadResponse = class BadResponse extends module.exports.Response {

  constructor(...args) {
    super({ ...args, status: HTTPStatus.BAD_REQUEST });
    Error.captureStackTrace(this, BadResponse);
  }

};

module.exports.BreakingResponse = class BreakingResponse extends module.exports.Response {

  constructor(...args) {
    super({ ...args, status: HTTPStatus.INTERNAL_SERVER_ERROR });
    Error.captureStackTrace(this, BreakingResponse);
  }

};

module.exports.NotFoundResponse = class NotFoundResponse extends module.exports.Response {

  constructor(...args) {
    super({ ...args, status: HTTPStatus.NOT_FOUND });
    Error.captureStackTrace(this, NotFoundResponse);
  }

};

module.exports.UnauthResponse = class UnauthResponse extends module.exports.Response {

  constructor(...args) {
    super({ ...args, status: HTTPStatus.UNAUTHORIZED });
    Error.captureStackTrace(this, UnauthResponse);
  }

};
