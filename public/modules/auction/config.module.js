'use strict';

angular.module('auction')
.config(['$stateProvider','$urlRouterProvider',
  function($stateProvider,$urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider.
    state('auction', {
      url: '/auction',
      templateUrl: '/modules/auction/views/auction.client.view.html',
      resolve:{
        auth: function($socket,$state,$q){
           var deferred = $q.defer();
           $socket.emit('authorization',true,function(data){
             if(data===null){
               console.error('Not logged in');
               deferred.reject();
               $state.go('login');
             }else{
               
               deferred.resolve(data);
             }
           });
           return deferred.promise;
        }
      }
    });
  }
]);
