// TODO. Currently just copied from engine.io-client

// this is a test server to support tests which make requests

var express = require('express');
var app = express();
var join = require('path').join;
var http = require('http').Server(app);
var server = require('engine.io').attach(http);
var browserify = require('../../support/browserify');

// http.listen(process.env.ZUUL_PORT);
http.listen(9005);

// server worker.js as raw file
app.use('/test/support', express.static(join(__dirname, 'public')));

// server engine.io.js via browserify
app.get('/test/support/engine.io.js', function(err, res, next) {
  browserify(function(err, src) {
    if (err) return next(err);
    res.set('Content-Type', 'application/javascript');
    res.send(src);
  });
});

server.on('connection', function(socket){
  socket.send('hi');

  socket.on('message', function (data) {
    if (data == 'more') {
      socket.send('success')
    }
  });
});
