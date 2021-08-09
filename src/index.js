const Joi = require("joi");


function isString(value) {
  return typeof value === "string" || value instanceof String
}


export class HttpError extends Error {
  constructor(message, status) {
    const schema = Joi.object({
      message: Joi.string(),
      status: Joi.number(),
    });
    const validated = Joi.attempt({message, status}, schema);
    super(validated.message);
    this.name = this.constructor.name;
    Object.assign(this, validated);
  }
}


const defaultMessage = "Set CONCEAL_ERRORS_MESSAGE for custom message";
export function errorHandlerMiddleware(options) {
  const schema = Joi.object({
    concealErrors: Joi.boolean().default(false),
    concealErrorsMessage: Joi.string().default(defaultMessage),
    logger: Joi.object().default(console),
  });
  const validated = Joi.attempt(options, schema);

  return function errorHandlerMiddleware(error, request, response, next) {
    var httpError;
    if (error instanceof HttpError) {
      httpError = error;
    }
    else {
      var message;
      if (!validated.concealErrors === true) {
        message = validated.concealErrorsMessage || defaultMessage;
        validated.logger.error(error);
      }
      else {
        message = error.message;
      }
      const errorArgs = {
        message,
        status: "500",
      };
      httpError = new HttpError(errorArgs);
    }

    return response.status(httpError.status).json({error: httpError.message})
  }

}

