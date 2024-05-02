"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePublishMessage = void 0;
const errors_1 = require("../error/errors");
const validatePublishMessage = (message) => {
    const requiredProperties = ["exchange", "exchangeType", "options", "body"];
    const missingFields = [];
    requiredProperties.forEach((prop) => {
        if (!(prop in message)) {
            missingFields.push(prop);
        }
    });
    if (missingFields.length > 0) {
        throw new errors_1.ValidationError(`Required fields are missing: ${missingFields.join(", ")}`);
    }
};
exports.validatePublishMessage = validatePublishMessage;
//# sourceMappingURL=index.js.map