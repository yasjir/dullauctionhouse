'use strict';

var config = require('../../config'),
    DB = require('../models/db.models'),
    _ = require('lodash'),
    Q = require('q'),
    AuctionHouse = require('../services/auction.service.js'),
    logger = require('winston');

exports.get_undone = function (socket, data, callback) {
  DB.Models.Auction.findAll({
    where:{
      status:{$lt:2} //only active and waiting auctions
    },
    attributes:['quantity', 'winning_bid', 'end_date_time','status'],
    order: 'end_date_time',
    include:[{
      model: DB.Models.Item,
      attributes: ['name','id','icon_url']
    },{
      model: DB.Models.User,
      as: 'Owner',
      attributes: ['username','id','coins']
    }]
  }).then(function(results){
    callback(results);
  })
  .catch(function (err) {
    logger.error(err);
    callback('ERROR');
  });
};

exports.set_new = function (socket, data, callback) {
  logger.debug(socket.user);
  DB.Models.Inventory.findOne({ //check if user can put this item on a auction
    userId:socket.user,
    itemId:data.item
  })
  .then(function(item){
    if(!item||(item.quantity-data.quantity)<=0){ //if not or user has no requested quantity of item tkrow an error
      throw {user_fail:true,
              message:'Cannot start an auction with requested parameters'};
    }
    return DB.sequelize.transaction(function(t){
      var now = new Date();
      var new_auction = DB.Models.Auction.create({
                              OwnerId: socket.user,
                              itemId: data.item,
                              quantity: data.quantity,
                              WinnerId: socket.user,
                              requested: now,
                              status: 0,
                              winning_bid: data.bid
                            },{transaction:t});
      var update_inventory = item.decrement({quantity:data.quantity},
                                              {transaction:t});
      return Q.all([new_auction,update_inventory]);
      });
  })
  .then(function (result) {
    AuctionHouse.force_check();
    exports.get_undone(socket,data,callback);
  })
  .catch(function (err) {
    logger.error(err);
    if(err.user_fail){
      callback({error:'REQUEST',
                message:err.message});
    }else{
      callback({error:'SERVER ERROR'});
    }

  });
};


exports.place_bid = function(socket, data, callback) {
  var user = DB.Models.User.findOne({
                  id:socket.user
                });
  var auction =DB.Models.Auction.findOne({
                  id:data.auction
                });
  var now = new Date();
  Q.all([user,auction])
  .spread(function(user,auction){
    if(user.coins<data.bid){
      throw {user_fail:true,
              message:'No enought coins'};
    }
    if((new Date(auction.end_date_time))<now){
      throw {user_fail:true,
              message:'Auction done before submition'};
    }
    if(auction.winning_bid>=data.bid){
      throw {user_fail:true,
              message:'Winning bid is currently larger'};
    }

    auction.winning_bid = data.bid;
    auction.winner = user.id;
    var wb= new Date(auction.end_date_time);
    wb.setSeconds(wb.getSeconds()+10);
    auction.end_date_time = wb;

    return auction.save();
  })
  .then(function (auction) {
    callback({'end_date_time':auction.end_date_time,
                winning_bid:data.bid});
  })
  .catch(function (err) {
    logger.error(err);
    if(err.user_fail){
      callback({error:'REQUEST',
                message:err.message});
    }else{
      callback({error:'SERVER ERROR'});
    }

  });

};
