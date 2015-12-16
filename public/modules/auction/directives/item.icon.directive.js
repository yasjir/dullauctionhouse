'use strict';

angular.module('auction')
  .directive('itemIcon',function(){
    return{
      restrict: 'E',
      scope:{
        item: '='
      },
      template:'<div class="item-icon" layout="column" layout-align="center center">'+
                  '<img flex  ng-src="{{ item.icon_url }}"/>'+
                  '<h4 flex >{{item.name}}</h4>'+
                '</div>'
    };
  });
