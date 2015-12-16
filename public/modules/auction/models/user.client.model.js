'use strict';

angular.module('auction')
  .factory('User',['$socket', '$q','_',
  function($socket, $q,_){

    function User(username,coins,inventory){
      this.coins = coins;
      this.username = username;
      this.inventory = inventory;
    }

    User.get_current = function(){
       var deferred = $q.defer();

       $socket.emit('user',true,function(data){

         if(data==='ERROR'){
           deferred.reject(data);
         }else{
           console.log(data);
           deferred.resolve(new User(data.user.username,
                                      data.user.coins,
                                      data.items));
         }
       });

       return deferred.promise;
    };

    User.prototype.toJSON = function () {
      return _.pick(this,'id','coins','inventory');
    };

    return User;
}]);
