'use strict';

angular.module('auction')
  .directive('quantityInfo',function(){
    return{
      restrict: 'E',
      scope:{
        quantity: '='
      },
      template:'<div class="item-icon" layout="column" layout-align="start center">'+
                  '<h4 flex><b>Quantity</b></h4>'+
                  '<h4 flex>{{quantity}}</h4>'+
                '</div>'
    };
  });
