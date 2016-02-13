/* global __dirname */
var express = require("express");
var app = express();
var path = require("path");

var Twit = require("twit");
var hashbombList = require("./hashbombs");

//if in development read password info from config file
if (process.env.NODE_ENV == "development") {
  var conf = require("./config");
} else { //production
  //Read info from server environment variable (or put config up there manually)
}

//new twitter object for sending and reading tweets
//Uses info from config file (use ex_config.js to create your own)
var tweeter = new Twit({
  consumer_key: conf.twitter.ConKey,
  consumer_secret: conf.twitter.ConSec,
  access_token: conf.twitter.AccTok,
  access_token_secret: conf.twitter.AccTokSec,
  timeout_ms: 60 * 1000
});

var list = []; //List of all the currently running tweets
var stream = tweeter.stream('user'); //new stream tweeter for idarbhash

//On tweet, create new tweetInfo object with an interval timer
stream.on('tweet', function(t) {
  //If the tweet to me includes an @idarbhash then save it with a timestamp
  //Example tweet @idarbhash #1234
  if (t.text.toLowerCase().includes(conf.twitter.username)) {
    console.log('receiving tweet ', t.text);
    var hashID = t.text.split(" ")[1]; //grab the game id of tweet (second word)
    //if we validate that the word is in fact an id create tweetinfo object
    if (hashID.startsWith("#") && hashID.length == 5) {
      var tweetInfo = {
        'gameID': hashID,     //gameID
        'start': Date.now(),  //time started
      };
      //Generate a new interval timer for the tweetInfo object
      tweetInfo.timer = setInterval(function () {
        sendHashbomb(tweetInfo);
      }, 0);

    }
  }
});

//When a setInterval is hit, this function is called which will use the
//given game id and send out a random hashbomb
function sendHashbomb (tweetInfo) {
  //tweet out to @idarbwire with random hashbomb + random string (avoid duplicates)
  var statusString = '@idarbwire ' + tweetInfo.gameID +
      ' ' + hashbombList[Math.round(Math.random() * hashbombList.length)] +
      ' ' + Math.round(Math.random() * 1000);

  console.log("tweeting bomb", statusString);

  //Send out the tweet
  tweeter.post('statuses/update', {
    status: statusString
  }, tweetOutHandler);

  //only keep game id in memory if game is still running (6minutes + halftime) = ~7 minutes
  if (Date.now() - tweetInfo.start > 420000) {
    console.log('killing interval for ', tweetInfo.gameID);
    window.clearInterval(tweetInfo.timer);
  } else { //reset the interval
    clearInterval(tweetInfo.timer);
    tweetInfo.timer = setInterval(function () {
      sendHashbomb(tweetInfo);
    }, Math.random() * 40000 + 20000);
  }
}

//Outputs errors from Twitter
function tweetOutHandler(err, data, response) {
  if (err) {
    console.log(err, data);
  }
}


app.listen(8008, function() {
  console.info('Server listening on port ' + this.address().port);
});
