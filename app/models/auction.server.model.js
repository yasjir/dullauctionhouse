'use strict';
var Sequelize = require('sequelize');

exports.create_models = function( sequelize){
  var Auction = sequelize.define('auction', {
      quantity: {
        type: Sequelize.INTEGER
      },
      winning_bid: {
        type: Sequelize.INTEGER
      },
      status:{
        type: Sequelize.INTEGER // 0 - waiting, 1-active, 2 - done
      },
      requested: {
        type: Sequelize.DATE
      },
      end_date_time: {
        type: Sequelize.DATE
      },
  },{
    timestamps: true,
    tableName: 'auction',
  });
  return {
    Auction : Auction
  };
};
