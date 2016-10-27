var express = require('express');
var router = express.Router();
var request = require('../request-wrapper')();

let doSomething = () => {
  return new Promise((resolve, reject) => {
    resolve();
  });
};

let sendRequest = (url) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: url,
      method: 'GET',
    };

    request(options, (error, response, body) => {
        if (error || response.statusCode !== 200) {
          reject();
        } else {
          resolve(body);
        }
      });
  });
};

/* GET users listing. */
router.get('/', function(req, res, next) {
  doSomething()
    .then(() => sendRequest('http://date.jsontest.com'))
    .then(() => sendRequest('http://ip.jsontest.com')) 
    .then(data => res.send(data))
    .catch(() => res.send('failed!'));
});

module.exports = router;
