'use strict';

angular.module('auction')
  .controller('AuctionController',['$scope','$socket', '$state', '$mdDialog','User',
  function($scope, $socket, $state, $mdDialog,User){

    $scope.user = null;
    User.get_current()
      .then(function(data) {
        $scope.user = data;
      })
      .catch(function(err){
        console.error(err);
      });

    $socket.emit('auctions',true,function (data) {
      $scope.auctions = data;
    });

    $socket.on('auction.end',function(data){
      console.log(data);
    });

    $socket.on('auction.start',function(data){
      console.log(data);
    })

    $scope.logout = function(){
      $socket.emit('logout',true,function (data) {
        if(data){
          $state.go('login');
        }
      });
    };

    function AuctionConfirmController($scope, $mdDialog,item) {
      $scope.item = item;
      $scope.bid = 100;
      $scope.quantity = 1;

      $scope.cancel = function() {
        $mdDialog.cancel();
      };
      $scope.answer = function() {
        $mdDialog.hide({
          quantity:$scope.quantity,
          bid:$scope.bid,
          item:item.id
        });
      };
    }

    $scope.auctionConfirm = function(item,ev){
      $mdDialog.show({
        controller: AuctionConfirmController,
        templateUrl: 'modules/auction/views/dialogs/auction.confirm.client.view.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        locals: {
           item: item
         },
        clickOutsideToClose:true,
        fullscreen:false
      })
      .then(function(data) {
        $socket.emit('auction.new',data,function(data){
          console.log(data);
        });
      });

    };

}]);
