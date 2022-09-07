const { StatusCodes } = require("http-status-codes");
const customError = require("./customError");

class badRequest extends customError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}
module.exports = badRequest;
