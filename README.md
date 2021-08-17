# Express HTTP Errors

[![Build status](https://img.shields.io/travis/tylerhaun/express-http-errors/master.svg?style=flat-square)](https://travis-ci.org/tylerhaun/express-http-errors)


HTTP errors + middleware handler for express


### USE

express app configuration

```

const { ErrorHandlerMiddleware } = require("express-http-errors")

const errorHandlerMiddlewareOptions = {
  logUnhandledErrors: true,
  log500Errors: true,
  concealErrors: false,
  concealErrorsMessage: "An error has occured.  Please contact support if this continues",
  logger: logger,
}
const errorHandlerMiddleware = new ErrorHandlerMiddleware(errorHandlerMiddlewareOptions);

const app = express();
//...
app.use(errorHandlerMiddleware)
//...


```


Inside handler

```

const { HttpError } = require("express-http-errors")

app.post("/dosomething", function(request, response, next) {
  //...
  const error = new HttpError("Bad parameters", 400);
  next(error);
  //...
})

```





