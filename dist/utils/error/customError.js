"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CustomError extends Error {
    code;
    constructor(message, code = 500) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        if (typeof Error.captureStackTrace === "function") {
            Error.captureStackTrace(this, this.constructor);
        }
        else {
            this.stack = new Error(message).stack;
        }
    }
}
exports.default = CustomError;
//# sourceMappingURL=customError.js.map