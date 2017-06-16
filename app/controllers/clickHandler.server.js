'use strict';

var User = require("../models/users.js");
var Poll = require("../models/polls.js");

function clickHandler () {
  
  this.getList = function (req, res) {
    Poll
      .find({}, {username: 1, pollName: 1})
      .exec(function (err, polls) {
        if(err) { throw err; }
        if(polls){
          res.send({polls});
        }else{
          res.send({numPolls: 0});
        }
      });
  };
  
  this.getUserList = function (req, res) {
    Poll
      .find({username: req.params.user}, {username: 1, pollName: 1})
      .exec(function (err, polls) {
        if (err) { throw err; }
        if (polls) {
          res.send({polls});
        } else {
          res.send({userNumPolls: 0});
        }
      });
  };
  
  this.getPoll = function (req, res) {
    Poll
      .findOne({username: req.params.user, pollName: req.params.poll}, {username: 1, pollName: 1, pollOptions: 1, _id: false})
      .exec(function (err, docs) {
        if (err) { throw err; }
        res.json(docs);
      });
  };
  
  this.addPoll = function (req, res,err) {
    if(req){
      var optionsArr = [];
      req.Options.forEach(function (opt) {
        optionsArr.push({voteOption: opt.name, voteCount: 0});
      });
      var data = {
        username: req.username,
        pollName: req.pollName,
        pollOptions: optionsArr
      };
      var newPoll = new Poll();
      newPoll.username = req.username;
      newPoll.pollName = req.pollName;
      newPoll.pollOptions = optionsArr;
      newPoll.save(function (err) {
        if (err) {throw err;}
      });
    }
  };
  
  this.deletePoll = function (req, res, err) {
    Poll
      .findOne({username: req.params.user, pollName: req.params.poll})
      .remove().exec(function (err) {
        if (err) { throw err; }
        res.json({message: "Poll has been deleted from database"});
      });
  };
  
  this.votePoll = function (req, res, err) {
	  var ip = req.headers['x-forwarded-for'].split(",")[0] || req.connection.remoteAddress;
    req = req.body;
    if(req.loginName != "guest"){
      Poll
        .findOneAndUpdate({username:req.username, pollName: req.poll, "pollOptions.voteOption":req.option, voters: {'$ne': req.loginName}},
                          {'$inc': {"pollOptions.$.voteCount" : 1 }, "$push": {voters: req.loginName} })
        .exec(function (err, results) {
          if (err) { throw err; }
          res.json(results);
        });
    }else{
      Poll
        .findOneAndUpdate({username:req.username, pollName: req.poll, "pollOptions.voteOption":req.option, ips: {'$ne': ip}},
                          {'$inc': {"pollOptions.$.voteCount" : 1 }, "$push": {ips: ip} })
        .exec(function (err, results) { 
          if (err) { throw err; }
          res.json(results);
        });
    }
  };
  
  this.addNewOption = function (req, res, err) {
    Poll
      .findOneAndUpdate({username: req.username, pollName: req.poll}, 
                        {"$push": {pollOptions: {voteOption: req.option, voteCount: 0} }},
                        {safe: true, upsert: true, new : true}
                       )
      .exec(function (err, results) {
        if (err) { throw err; }
      });
  };
  
}

module.exports = clickHandler;