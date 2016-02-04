/* global __dirname */
var express = require("express");
var app = express();
var path = require("path");

var Twit = require("twit");

//if in development read password info from config file
if (process.env.NODE_ENV == "development") {
  var conf = require("./config");
}

//new twitter object for sending and reading tweets
var tweeter = new Twit({
  consumer_key: conf.twitter.ConKey,
  consumer_secret: conf.twitter.ConSec,
  access_token: conf.twitter.AccTok,
  access_token_secret: conf.twitter.AccTokSec,
  timeout_ms: 60 * 1000
});

var list = []; //List of all the currently running tweets
var stream = tweeter.stream('user'); //new stream tweeter for idarbhash
//Whenever @idarbhash receives a tweet run this function with the tweet object t
stream.on('tweet', function(t) {
  //If the tweet to me includes an @idarbhash then save it with a timestamp
  //Example tweet @idarbhash #1234
  if (t.text.toLowerCase().includes(conf.twitter.username)) {
    console.log('receiving tweet ', t.text);
    var hashID = t.text.split(" ")[1]; //grab the game id part of tweet
    //if we validate that the word is in fact an id
    if (hashID.startsWith("#") && hashID.length == 5) {
      var tweetInfo = {
        'gameID': hashID,     //gameID
        'start': Date.now(),  //time started
        //'timer': setInterval(sendHashbomb, 0) //set an immediate interval
        // 'last': Date.now(),   //last time hashbombed
        // 'delay': 0            //delay time: start now
      };
      tweetInfo.timer = setInterval(function () {
        sendHashbomb(tweetInfo);
      }, 0);
      //list.push(tweetInfo);
      //console.log(tweetInfo);
    }
  }
  //console.log(list);
});

//Start the periodic timer for sending out batch hashbombs


/*
  sendHashbombs
  periodically go through the list of game IDs, do checks and if appropriate
  send out a hashbomb.
  4 1.5min rounds = 6minutes total with a halftime game.
*/
function sendHashbombs() {
  for (var i = 0; i < list.length; i++) {
    //If delay == 0 (first time)
    //If it has been greater than x seconds (10) + random delay time then bomb
    if (list[i].delay === 0 || (Date.now() - list[i].last) > (10000 + list[i].delay)) {
      //tweet out to @idarbwire with random hashbomb
      tweeter.post('statuses/update', {
        status: '@idarbwire ' + list[i].gameID + ' ' + hashbomb
      }, tweetOutHandler);
      //set last to now and choose a random delay
      list[i].last = Date.now(); //Set to the current time
      list[i].delay = Math.random() * 40000 + 20000; //min of 20 seconds max of 60 seconds
    }
    //only keep this in memory if game is still running (6minutes + halftime) = 7minutes
    if (Date.now() - list[i].start > 420000) {
      list.splice(i, 1); //remove the id from array
    }
  }
}

function sendHashbomb (tweetInfo) {
  console.log('Sending out bomb for ', '@idarbwire ' + tweetInfo.gameID + ' #light ' + Math.round(Math.random() * 1000));
  //tweet out to @idarbwire with random hashbomb + random string (avoid duplicates)
  tweeter.post('statuses/update', {
    status: '@idarbwire ' + tweetInfo.gameID + ' #smash ' + Math.round(Math.random() * 1000)
  }, tweetOutHandler);

  //only keep this in memory if game is still running (6minutes + halftime) = 7minutes
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

function tweetOutHandler(err, data, response) {
  if (err) {
    console.log(err, data);
  }
}

//realistically not used
app.get("/", function(req, res) {
  tweeter.post('statuses/update', {
    status: 'hello world!'
  }, function(err, data, response) {
    //console.log(data);
  });
  res.sendFile(__dirname + "/public/views/index.html"); //Sends back index.html
});

app.listen(8008, function() {
  console.info('Server listening on port ' + this.address().port);
});
