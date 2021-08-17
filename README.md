


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





