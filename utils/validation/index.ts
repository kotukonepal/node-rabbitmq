import { QueueData } from "../../src/types/mq.types";
import { ValidationError } from "../error/errors";

const validatePublishMessage = <T>(message: QueueData<T>) => {
  const requiredProperties = ["queueName", "options", "payload"];

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
