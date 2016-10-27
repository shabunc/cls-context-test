const {Tracer, ExplicitContext, ConsoleRecorder} = require('zipkin');
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;
const CLSContext = require('zipkin-context-cls');

const ctxImpl = new CLSContext();
const recorder = new ConsoleRecorder();
const tracer = new Tracer({ctxImpl, recorder});

module.exports = tracer;