'use strict';

angular.module('login')
.config(['$stateProvider','$urlRouterProvider',
  function($stateProvider,$urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider.
    state('login', {
      url: '/',
      templateUrl: '/modules/login/views/login.client.view.html',
    });
  }
]);
