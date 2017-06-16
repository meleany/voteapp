'use strict';

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var User = new Schema({
  github: {
    id: String,
    username: String,
    displayName: String,    
    publicRepos: String
  }  
});

module.exports = mongoose.model("User", User);