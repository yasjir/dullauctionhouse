'use strict';
var Sequelize = require('sequelize');

exports.create_models = function( sequelize){
  var Inventory = sequelize.define('inventory', {
      quantity: {
        type: Sequelize.INTEGER
      },
  },{
    timestamps: true,
    tableName: 'inventory',
  });
  return {
    Inventory : Inventory
  };
};
