const assert = require("assert");
const express = require("express");
const {HttpError, ErrorHandlerMiddleware} = require("../src");
const path = require("path");

const errorMessage = "test message";

const context = {};


class MockLogger {
  constructor() {
    this.reset();
  }
  log(d) {
    this.logs.push(d);
  }
  error(d) {
    this.errors.push(d);
  }
  reset() {
    this.logs = [];
    this.errors = [];
  }
}
const mockLogger = new MockLogger();


function randomBoolean(offset) {
  offset = .5
  return Boolean(Math.random() >= offset)
}

// TODO test all cases rather than random
const errorHandlerMiddlewareOptions = {
  logUnhandledErrors: randomBoolean(),
  log500Errors: randomBoolean(),
  concealErrors: randomBoolean(),
  concealErrorsMessage: errorMessage,
  logger: mockLogger,
}
const errorHandlerMiddlewareInstance = new ErrorHandlerMiddleware(errorHandlerMiddlewareOptions);
console.log(errorHandlerMiddlewareInstance, errorHandlerMiddlewareInstance.length)


before(async function() {
  console.log("before()");

  const rootPath = path.join(__dirname, "routes");
  const app = express();
  app.get("/ping", function(request, response, next) {
    return response.json({pong: true});
  })
  app.post("/httperror400", function(request, response, next) {
    console.log("httperror400");
    const error = new HttpError("400 error", 400);
    return next(error);
  })
  app.post("/httperror500", function(request, response, next) {
    console.log("error")
    const error = new HttpError("500 error", 500);
    return next(error);
  })
  app.post("/error", function(request, response, next) {
    console.log("error")
    const error = new Error("Default error");
    return next(error);
  })
  app.use(errorHandlerMiddlewareInstance)
  const server = app.listen();
  context.server = server;

  request = require('supertest')(server);
  context.request = request;
})


describe("express", () => {
  it("should ping", async function() {
    const response = await context.request.get("/ping")
      .expect(200)
  })
})

describe("handle HttpError", () => {

  it("should successfully return HttpError with code 400", async function() {
    const response = await context.request.post("/httperror400").expect(400);
    console.log(response.body);
    assert.equal(mockLogger.errors.length, 0);
    mockLogger.reset();
  })

  it("should successfully return HttpError with code 500", async function() {
    const response = await context.request.post("/httperror500").expect(500)
    console.log(response.body);
    const expectedLogs = Number(errorHandlerMiddlewareOptions.log500Errors);
    assert.equal(mockLogger.errors.length, expectedLogs);
    mockLogger.reset();
  })

  it("should successfully return default Error with code 500", async function() {
    const response = await context.request.post("/error").expect(500)
    console.log(response.body);
    if (errorHandlerMiddlewareOptions.concealErrors) {
      assert.equal(response.body.message, errorMessage);
    }
    const expectedLogs = Number(errorHandlerMiddlewareOptions.logUnhandledErrors || errorHandlerMiddlewareOptions.log500Errors);
    assert.equal(mockLogger.errors.length, expectedLogs);
    mockLogger.reset();
  })

})

after(async () => {
  console.log("after()");
  context.server.close();
});
