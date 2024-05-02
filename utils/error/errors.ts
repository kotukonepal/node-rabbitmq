import CustomError from "./customError";

class ConnectionFailError extends CustomError {
  constructor(message: string) {
    super(message, 400);
  }
}

class MessagePublishError extends CustomError {
  constructor(message: string) {
    super(message, 400);
  }
}

class ValidationError extends CustomError {
  constructor(message: string) {
    super(message, 400);
  }
}
export { ConnectionFailError, MessagePublishError, ValidationError };
