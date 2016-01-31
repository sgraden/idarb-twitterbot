/* global __dirname */
var express = require("express");
var app = express();
var path = require("path");

var hbs = require("hbs"); //Render handlebars

app.use('/public', express.static(__dirname + '/public')); //Configure the root of the folder

app.set("view engine", "html");
app.engine("html", hbs.__express); //set view engine to handlebars

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "public", "views", "index.html")); //Send back html file
});

app.get("/Hi", function(req, res) {
    res.render("index", {
        name: "bob",
        greeting: "jonathan"
    }); //Handlebars stuff
});

app.listen(8008, function() {
    console.info('Server listening on port ' + this.address().port);
});
