// Voting App by Yasmin Melean 05/2017 using MEAN stack based on Clementine.js boilerplate.
'use strict';

var express = require("express");
var mongoose = require("mongoose");
var routes = require("./app/routes/index.js");
var passport = require("passport");
var session = require("express-session");
var bodyParser = require("body-parser");
var app = express();

// create application/x-www-form-urlencoded parser
//var urlencodedParser = bodyParser.urlencoded({ extended: true });
var jsonParser = bodyParser.json();
app.use(jsonParser);

var path = process.cwd();
app.use("/public", express.static(path + "/public"));
app.use("/controllers", express.static(path + "/app/controllers"));

require("dotenv").config();
require("./app/config/passport")(passport);

mongoose.connect(process.env.MONGODB_URI);
mongoose.Promise = global.Promise;  // Use to solve mongoose mpromise depreacation warning

app.use(session({ 
  secret: 'secretVote App', 
  resave: false, 
  saveUninitialized: true 
}));

app.use(passport.initialize());
app.use(passport.session());

routes(app, passport);

// Starts the server and listens on PORT
// The default routing is 0.0.0.0 represented by :: in IPv6
var PORT = process.env.PORT || 3000;
var server = app.listen(PORT, function(){
  var host = server.address().address;
  if(host == "::") { host =  "0.0.0.0"}
  var port = server.address().port;
  console.log("VotApp running on: http://%s:%s", host, port);
});