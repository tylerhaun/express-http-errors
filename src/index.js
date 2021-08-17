const Joi = require("joi");


function isString(value) {
  return typeof value === "string" || value instanceof String
}


class ExtensibleFunction extends Function {
  constructor(f) {
    console.log("ExtensibleFunction", f);
    return Object.setPrototypeOf(f, new.target.prototype);
  }
}


class HttpError extends Error {
  constructor(message, status) {
    console.log("HttpError", message, status);
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
module.exports.HttpError = HttpError;



const defaultMessage = "Set CONCEAL_ERRORS_MESSAGE for custom message";
class ErrorHandlerMiddleware extends ExtensibleFunction {
  length = 4; // trigger express handle_error layer
  constructor(options) {
    const schema = Joi.object({
      logUnhandledErrors: Joi.boolean().default(true),
      log500Errors: Joi.boolean().default(true),
      concealErrors: Joi.boolean().default(false),
      concealErrorsMessage: Joi.string().allow('').default(defaultMessage),
      logger: Joi.object().default(console),
    });
    const validated = Joi.attempt(options, schema);

    super(function() { return this.handle.apply(this, arguments); });

    this.options = validated;
    this.logger = validated.logger;

    return this.bind(this); 

  }

  handle(error, request, response, next) {
    var httpError;
    const eIoHe = error instanceof HttpError;
    const l5e = this.options.log500Errors;
    const lue = this.options.logUnhandledErrors;

    if (eIoHe) {
      httpError = error;
    }
    else {
      var message;

      if (this.options.concealErrors === true) {
        message = this.options.concealErrorsMessage || defaultMessage;
      }
      else {
        message = error.message;
      }

      httpError = new HttpError(message, 500);

    }

    if (!eIoHe && lue && !l5e) { //unhandled error
      console.log("(!eIoHe && lue && !l5e)")
      this.logger.error(error);
    }
    if (l5e && httpError.status == 500) {
      console.log("(l5e && httoError.status == 500)");
      this.logger.error(error);
    }

    return response
      .status(httpError.status)
      .json({
        message: httpError.message,
        status: httpError.status,
      })
  }

}
module.exports.ErrorHandlerMiddleware = ErrorHandlerMiddleware;




//function errorHandlerMiddleware(options) {
//  console.log("errorHandlerMiddleware", options);
//  const schema = Joi.object({
//    concealErrors: Joi.boolean().default(false),
//    concealErrorsMessage: Joi.string().allow('').default(defaultMessage),
//    logger: Joi.object().default(console),
//  });
//  const validated = Joi.attempt(options, schema);
//  console.log("validated", validated);
//
//  return function errorHandlerMiddleware(error, request, response, next) {
//    var httpError;
//    if (error instanceof HttpError) {
//      httpError = error;
//    }
//    else {
//      var message;
//      if (validated.concealErrors !== true) {
//        message = validated.concealErrorsMessage || defaultMessage;
//        validated.logger.error(error);
//      }
//      else {
//        message = error.message;
//      }
//      httpError = new HttpError(message, 500);
//    }
//
//    return response
//      .status(httpError.status)
//      .json({
//        message: httpError.message,
//        status: httpError.status,
//      })
//  }
//
//}
//module.exports.errorHandlerMiddleware = errorHandlerMiddleware;
