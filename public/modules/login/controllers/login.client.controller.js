'use strict';

angular.module('login')
  .controller('LogInController',['$scope','$socket', '$state',
  function($scope, $socket, $state){


  $socket.on('greet',function(data){
    console.log(data);
  });

  $scope.login = function(){
    $socket.emit('login', $scope.username, function(data){
      $state.go('auction');
    });
  };
}]);
