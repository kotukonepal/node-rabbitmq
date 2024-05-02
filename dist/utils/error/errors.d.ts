import CustomError from "./customError";
declare class ConnectionFailError extends CustomError {
    constructor(message: string);
}
declare class MessagePublishError extends CustomError {
    constructor(message: string);
}
declare class ValidationError extends CustomError {
    constructor(message: string);
}
export { ConnectionFailError, MessagePublishError, ValidationError };
