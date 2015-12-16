'use strict';

var config = require('../../config'),
    DB = require('../models/db.models'),
    _ = require('lodash'),
    q = require('q'),
    logger = require('winston');

var io= null;

var timeout = 1000; //ms
var timer = null;


function payment_transaction(auction){
  logger.info('Making payment');

  auction.status = 2;
  var result = {auction: auction.id,
            winner:{id:auction.Winner.id},
            owner:{id:auction.Owner.id},
            item: auction.itemId};
  if(auction.Winner.id ===auction.Owner.id){
    logger.debug('No one wins this auction');
    return DB.Models.Inventory.findOne({where:{
            userId: auction.Winner.id,
            itemId: auction.itemId
          }})
          .then(function(pocket){
            logger.debug(pocket);
            var promises = [auction.save()];
            if(pocket){
              pocket.quantity += auction.quantity;
              promises.push(pocket.save);
            }
            return q.all(promises);
          })
          .then(function(){
            return q(result);
          });
  }
  return DB.sequelize.transaction(function(t){
    auction.Winner.coins -= auction.winning_bid;
    auction.Owner.coins += auction.winning_bid;
    result.winner.coins = auction.Winner.coins;
    result.owner.coins = auction.Owner.coins;
    return q.all([
                  auction.Winner.save({transaction:t}),
                  auction.Owner.save({transaction:t}),
                  auction.save({transaction:t})])
            .spread(function(winner,owner){
              return q.all([DB.Models.Inventory.findOne({
                where:{
                  userId:winner,
                  itemId:auction.itemId
                }
              }),DB.Models.Inventory.findOne({
                where:{
                  userId:owner,
                  itemId:auction.itemId
                }
              })]);
            })
            .spread(function(winner_inv,owner_inv){
              result.winner.quantity = winner_inv.quantity+auction.quantity;
              result.owner.quantity = owner_inv.quantity-auction.quantity;
              return q.all([
                winner_inv.increment({quantity:auction.quantity},{transaction:t}),
                owner_inv.decrement({quantity:auction.quantity},{transaction:t}),
              ]);
            }).then(function() {
              return result;
            });
          });
}

function select_new_active_auction(){
  return DB.Models.Auction.findAll({ // not very efficient....
    where:{status:0},
    order: 'requested',
    include:[{
      model: DB.Models.Item,
      attributes: ['name','id','icon_url']
    },{
      model: DB.Models.User,
      as: 'Winner',
      attributes: ['username','id','coins']
    },{
      model: DB.Models.User,
      as: 'Owner',
      attributes: ['username','id','coins']
    }]
  })
  .then(function(auctions){
    // logger.debug(auctions);
    if(auctions&&auctions.length>0){
      var end = new Date();
      end.setSeconds(end.getSeconds()+90);
      auctions[0].end_date_time = end;
      auctions[0].status = 1;

      io.emit('auction.start',auctions[0]);
      return auctions[0].save();
    }
    else{
      return false;
    }
  });

}

function check_auctions(){
  logger.info('Looking for active auctions');
  DB.Models.Auction.findAll({
    where : {status:1}, //check for active auctions
    include: [{
      model: DB.Models.User,
      as: 'Owner',
      attributes: ['username','id','coins']
    },{
      model: DB.Models.User,
      as: 'Winner',
      attributes: ['username','id','coins']
    }]
  })
  .then(function(active){
    var now = new Date();
    // console.log(active);
    if(!active||active.length===0){
      logger.info('No active auctions');
      return select_new_active_auction();
    }else if(active[0].end_date_time<=now){
      active = active[0];
      logger.info('Found');
      return payment_transaction(active)
        .then(function (result) {
          io.emit('auction.end',result);
          return select_new_active_auction();
        });
    }else{
      return true;
    }
  })
  .then(function(new_auction){
    if(new_auction){
      timer = setTimeout(check_auctions, timeout);
    }
  })
  .catch(function(err){
    logger.error('Failed to check auctions');
    logger.error(err);
  });
}

exports.run = function(socketio){
  logger.info('AuctionHouse ready to go');
  io=socketio;
  timer = setTimeout(check_auctions, timeout);
};

exports.force_check = function(){
  if(timer){
      clearTimeout(timer);
  }
  check_auctions();
  // timer = setTimeout(check_auctions, timeout);
};
