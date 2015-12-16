'use strict';

var config = require('../../config'),
    passport = require('passport'),
    DB = require('../models/db.models'),
    _ = require('lodash'),
    Q = require('q'),
    logger = require('winston');

exports.authorization = function(socket, data, callback) {
  // returns user object stored in socker object
  callback(socket.user);
};


exports.login = function(socket, data, callback) {
  logger.info('User %s sign in',data);
  DB.Models.User.findOne({
    where:{
      username: data
    }
  })
  .then(function(user) {
      if (!user) {
        return DB.create_default_user(data); //if there is no such user the create one
      }
      else{
        return user; //if user exists then pass it througth
      }
  })
  .then(function(user){
    socket.set_user(user.id);
    callback('OK');
  })
  .catch(function(err){
      logger.error(err);
      socket.disconnect('ERROR');
  });
};

exports.logout = function(socket, data, callback) {
  delete socket.user;
  callback(true);
};

exports.data = function(socket, data, callback) {
  //returns user data and its inventory
  DB.Models.User.findOne({
    where:{
      id: socket.user
    }
  })
  .then(function(results){
    return Q.all([results,
      results.getItems()]);
  })
  .spread(function(user,items){
    var inventory =
    callback({
      user:_.pick(user,'id','username','coins'),
      items: _.map(items,function(item){
        return {
          name: item.name,
          id: item.id,
          icon_url: item.icon_url,
          quantity : item.inventory.quantity
        };
      })
    });
  }).catch(function (err) {
    logger.error(err);
    callback('ERROR');
  });
};
