'use strict';

angular.module('auction')
  .directive('auctionPanel',['$socket','_','$timeout',
  function($socket,_,$timeout){
    function link($scope){
      $scope.test = 'sdsdsd';
      $scope.current = {};
      $scope.time_left=90;
      $scope.bid = 0;
      var timer = null;
      // console.log($scope.auctions);

      $scope.placeBid = function(){
        $socket.emit('auction.bid',{auction:$scope.current,bid:$scope.bid},function(data){
          console.log(data);
          _.assign($scope.current, _.pick(data,'winning_bid','end_date_time'));
          $scope.current.end_date_time =  new Date($scope.current.end_date_time);
          $scope.bid = $scope.current.winning_bid+1;
        });
      };



      $scope.$watch('auctions',function(newVal){
        $scope.current = _.find(newVal,'status',1);
        if(newVal&&$scope.current){
          console.log($scope.current);
          $scope.current.end_date_time =  new Date($scope.current.end_date_time);
          $scope.bid = $scope.current.winning_bid+1;
          var now = new Date();
          $scope.time_left = ($scope.current.end_date_time.getTime()-now.getTime())/1000;
          if($scope.time_left<0){
            $scope.time_left = 0;
            return;
          }
          if(timer){
            $scope.stopTimer();
          }
          $scope.startTimer();
        }else{
          $scope.current = {};
        }
        // console.log(  $scope.current);
      });

      $scope.onTimeout = function() {
        var now = new Date();
        $scope.time_left = ($scope.current.end_date_time.getTime()-now.getTime())/1000;
        if($scope.time_left<0){
          $scope.time_left = 0;
          $scope.$broadcast('timer-stopped', 0);
              $timeout.cancel(timer);
              return;
        }
        timer = $timeout($scope.onTimeout, 1000);
      };
      $scope.startTimer = function() {
          timer = $timeout($scope.onTimeout, 1000);
      };
      $scope.stopTimer = function() {
          $scope.$broadcast('timer-stopped', $scope.counter);
          $scope.counter = 90;
          $timeout.cancel(timer);
      };

      $scope.$on('timer-stopped', function(event, remaining) {

      });


    }


    return {
      restrict: 'E',
      scope:{
        auctions: '='
      },
      templateUrl: 'modules/auction/views/directives/auction.panel.client.view.html',
      link: link
    };
  }]);
