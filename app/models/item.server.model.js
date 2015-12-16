'use strict';
var Sequelize = require('sequelize');

exports.create_models = function( sequelize){
  var Item = sequelize.define('item', {
      name: {
        type: Sequelize.STRING(128),
        unique: true,
      },
      icon_url: {
        type: Sequelize.STRING(128),
      }
  },{
    timestamps: true,
    tableName: 'item',
  });

  return {
    Item : Item
  };
};
