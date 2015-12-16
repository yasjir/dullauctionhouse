'use strict';
var Sequelize = require('sequelize');

exports.create_models = function( sequelize){
  var User = sequelize.define('user', {
      username: {
        type: Sequelize.STRING(128),
        unique: true,
      },
      coins: {
        type: Sequelize.INTEGER,
        default: 1000,
      }
  },{
    timestamps: true,
    tableName: 'user',
  });

  return {
    User : User
  };
};
