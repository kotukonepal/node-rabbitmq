"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.MessagePublishError = exports.ConnectionFailError = void 0;
const customError_1 = __importDefault(require("./customError"));
class ConnectionFailError extends customError_1.default {
    constructor(message) {
        super(message, 400);
    }
}
exports.ConnectionFailError = ConnectionFailError;
class MessagePublishError extends customError_1.default {
    constructor(message) {
        super(message, 400);
    }
}
exports.MessagePublishError = MessagePublishError;
class ValidationError extends customError_1.default {
    constructor(message) {
        super(message, 400);
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=errors.js.map