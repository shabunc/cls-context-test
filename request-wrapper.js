var request = require('request');
var tracer = require('./tracer');
var {HttpHeaders, Annotation} = require('zipkin');

function getHeaders(traceId, opts) {
  const headers = opts.headers || {};
  headers[HttpHeaders.TraceId] = traceId.traceId;
  headers[HttpHeaders.SpanId] = traceId.spanId;

  traceId._parentId.ifPresent(psid => {
    headers[HttpHeaders.ParentSpanId] = psid;
  });
  traceId.sampled.ifPresent(sampled => {
    headers[HttpHeaders.Sampled] = sampled ? '1' : '0';
  });

  return headers;
}

function wrapRequest() {
  return function zipkinRequest(opts, callback) {
      tracer.scoped(() => {
        tracer.setId(tracer.createChildId());
        const traceId = tracer.id;

        const method = opts.method || 'GET';
        tracer.recordServiceName('test');
        tracer.recordRpc(`${method.toUpperCase()}:${opts.url}`);
        tracer.recordBinary('http.url', opts.url);
        tracer.recordAnnotation(new Annotation.ClientSend());

        const headers = getHeaders(traceId, opts);
        const zipkinOpts = Object.assign({}, opts, { headers });

        request(zipkinOpts, (error, response, body) => {
          if (error || response.statusCode !== 200) {
            tracer.scoped(() => {
              tracer.setId(traceId);
              tracer.recordBinary('request.error', error || response.statusCode.toString());
              tracer.recordAnnotation(new Annotation.ClientRecv());
            });
          } else {
            tracer.scoped(() => {
              tracer.setId(traceId);
              tracer.recordBinary('http.status_code', response.statusCode.toString());  
              tracer.recordAnnotation(new Annotation.ClientRecv());
            });
          }

          callback(error, response, body);    
      });
    });
  };
}

module.exports = wrapRequest;
