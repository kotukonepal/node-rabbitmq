import { ExchangeData } from "../../src/types/mq.types";
import { ValidationError } from "../error/errors";

const validatePublishMessage = <T>(message: ExchangeData<T>) => {
  const requiredProperties = ["exchange", "exchangeType", "options", "body"];

  const missingFields: string[] = [];

  requiredProperties.forEach((prop) => {
    if (!(prop in message)) {
      missingFields.push(prop);
    }
  });

  if (missingFields.length > 0) {
    throw new ValidationError(
      `Required fields are missing: ${missingFields.join(", ")}`
    );
  }
};

export { validatePublishMessage };
