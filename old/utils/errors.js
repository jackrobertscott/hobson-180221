const HTTPStatus = require('http-status');

class ResponseError extends Error {

  constructor({ message, code = HTTPStatus.INTERNAL_SERVER_ERROR, data } = {}) {
    if (message && typeof message !== 'string') {
      throw new Error('Expected "message" parameter passed to new ResponseError() to be a string.');
    }
    if (code && typeof code !== 'number') {
      throw new Error('Expected "code" parameter passed to new ResponseError() to be a number.');
    }
    let status;
    if (code >= 500 && code < 600) {
      status = 'error';
    } else if (code >= 400 && code < 500) {
      status = 'fail';
    } else {
      throw new Error('Expected "code" parameter passed to createError() to be between 400 and 600.');
    }
    super(message || 'Error has occurred on the server.');
    this.status = status;
    this.code = code;
    if (data) {
      this.data = data;
    }
    Error.captureStackTrace(this, ResponseError);
  }

}
module.exports.ResponseError = ResponseError;
