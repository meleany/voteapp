'use strict';

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Poll = new Schema({
    username: String,
    pollName: String,
    pollOptions: [{voteOption:String, voteCount: Number}],
    //voters: [{voterName: String, ip: String}],
    voters: [],
    ips: []
});

module.exports = mongoose.model("Poll", Poll); 