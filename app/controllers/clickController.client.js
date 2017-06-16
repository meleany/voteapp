'use strict';

(function() {

  angular
    .module("voteapp", ["chart.js", "ngResource"])
    .controller("logController", ["$scope", "$rootScope", "$resource", "$window", function($scope, $rootScope, $resource, $window) {
      
      var apival = $resource("/api/login");
      apival.get(function(logval) {
        $scope.logged = logval.logged;
        if ($scope.logged) {
          $scope.loginName = logval.userid.username;
          $rootScope.loginName = $scope.loginName;
        } else {
          $rootScope.loginName = "guest";
        }
      });
      
      $scope.redirect = function(path) {
        $window.location.href = path;
      };

    }])
    .controller("formController", ["$scope", "$http", "$window", "$rootScope", function($scope, $http, $window, $rootScope) {

      $scope.options = [{ id: "opt1" }, { id: "opt2" }];
      $scope.addNewOption = function() {
        var newOpt = $scope.options.length + 1;
        $scope.options.push({ "id": "opt" + newOpt });
      };
      
      $scope.$watch("$root.loginName", function () {
      $scope.submit = function() {
        var data = {
          username: $rootScope.loginName,
          pollName: $scope.user.pollName,
          Options: $scope.options
        };
        $http.post("/form", data).then(function successCallback(response) {
          $window.location.href = "/profile"; // this callback will be called asynchronously when the response is available
        }, function errorCallback(response) {}); // called asynchronously if an error occurs or server returns response with an error status.
      }
      });

    }])
    .controller("listController", ["$scope", "$resource", "$window", "$rootScope", function($scope, $resource, $window, $rootScope) {

        var List = $resource("/api/list");
        List.get(function(results) {
          $scope.results = results.polls;
          $scope.numPolls = results.polls.length;
        });

        $scope.visit = function(liuser, lipoll) {
          $window.location.href = "/poll" + "?name=" + liuser + "&poll=" + lipoll;
        };
        
        $scope.$watch("$root.loginName", function () {
          if($rootScope.loginName){  
            var userList = $resource("/api/:user", { user: "@username" });
            userList.get({user: $rootScope.loginName}, function (results) {
              $scope.useResults = results.polls;
              $scope.userNumPolls = results.polls.length;  
            });
          }
        });
        
      }
    ])
    .controller("chartController", ["$scope", "$resource", "$window", "$http", "$rootScope", function($scope, $resource, $window, $http, $rootScope) {
      
      var urlString = $window.location.href;
      var urlParams = new URL(urlString);
      $scope.sharefbUrl = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(urlString);
      
      var liuser = urlParams.searchParams.get("name");
      var lipoll = urlParams.searchParams.get("poll");
      
      var chartData = [];
      var chartLabels = [];
      var selectedPoll = $resource("/api/:user/:poll", { user: "@username", poll: "@pollname" });      
      $scope.getPollData = function () {
        chartData = [];
        chartLabels = [];
        selectedPoll.get({user: liuser, poll: lipoll }, function(results) {
          $scope.pollTitle = results.pollName;
          $scope.userLogin = results.username;
          $scope.pollOptions = results.pollOptions;
          results.pollOptions.forEach(function(poll) {
            chartData.push(poll.voteCount);
            chartLabels.push(poll.voteOption);
          });
          $scope.labels = chartLabels;
          $scope.data = chartData;
        });        
      };
      
      if(lipoll && liuser){
        $scope.getPollData();
      }
      
      var voted = false;
      $scope.submitVote = function() {
        if ($scope.answer == null) {
          alert("Please, select desired option and vote again");
        } else {
          var data = {
            username: liuser,
            poll: lipoll,
            option: $scope.answer,
            loginName: $rootScope.loginName
          }
          $http.post("/api/vote", data).then(function successCallback(response) {
            if(response.data != null) {
              $scope.getPollData(); // this callback will be called asynchronously when the response is available              
            }else{
              alert("You can only vote once as user or ip!");
            }
          }, function errorCallback(response) {
          }); // called asynchronously if an error occurs or server returns response with an error status          
        }
      };

      $scope.addOption = function(newOpt) {
        if (newOpt) {
          $scope.pollOptions.push({
            voteOption: newOpt,
            voteCount: 0
          });
          var data = {
            username: liuser,
            poll: lipoll,
            option: newOpt
          }
          $http.post("/api/newopt", data).then(function successCallback(response) {
            // this callback will be called asynchronously when the response is available
          }, function errorCallback(response) {}); // called asynchronously if an error occurs or server returns response with an error status          
        } else {
          alert("Not new option given");
        }
      }

      $scope.deletePoll = function() {
        if (confirm("Deleting poll, are you sure?")) {
          alert("deleted");
          selectedPoll.delete({
            user: liuser,
            poll: lipoll
          }, function(res) {
            $window.location.href = "/profile";
          });
        }
      };

      $scope.colors = ['#001A33', '#F0F5F5', '#DCDCDC', '#FF0000', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360',
        '#99FF66', '#B30000', '#EFFFCC', '#7575A3', '#803690', '#00ADF9', '#ffff80', '#39e600',
        '#FDB45C', '#949FB1', '#4D5360', '#C6538C', '#FCFCCF'
      ];
      $scope.charOptions = {
        cutoutPercentage: 40,
        legend: {
          display: true,
          position: "right",
          labels: {
            boxWidth: 15,
            fontColor: "rgb(255,255,255)",
            fontSize: 14,
            fontFamily: "Impact"
          }
        },
        tooltips: {
          //mode: "index"//"label"
        },
        tooltipTemplate: "<%= value %>",
        onAnimationComplete: function() {
          this.showTooltip(this.segments, true);
        },
        tooltipEvents: [],
        showTooltips: true,
      };
      
    }])

})();