/* global __dirname */
var express = require("express");
var app = express();
var path = require("path");

var Twit = require("twit");
if (process.env.NODE_ENV == "development") {
  var conf = require("./config");
}

var tweeter = new Twit({
  consumer_key: conf.twitter.ConKey,
  consumer_secret: conf.twitter.ConSec,
  access_token: conf.twitter.AccTok,
  access_token_secret: conf.twitter.AccTokSec,
  timeout_ms: 60 * 1000
});

app.get("/", function(req, res) {
  tweeter.post('statuses/update', {
    status: 'hello world!'
  }, function(err, data, response) {
    console.log(data);
  });
  res.sendFile(__dirname + "/public/views/index.html"); //Sends back index.html
});

app.listen(8008, function() {
  console.info('Server listening on port ' + this.address().port);
});
