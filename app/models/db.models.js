'use strict';

var	config = require('../../config'),
	  _ = require('lodash'),
    Q = require('q'),
		logger = require('winston'),
	  cls = require('continuation-local-storage'),
    namespace = cls.createNamespace('render-server'),
	  Sequelize = require('sequelize');

exports.connect = function(host,user,password,data) {

	Sequelize.cls = namespace;
	var sequelize = new Sequelize(host,user,password,data);

	var	users = require('./user.server.model'),
      items = require('./item.server.model'),
      auction = require('./auction.server.model'),
      inventory = require('./inventory.server.model');

	var Models = {};

	_.merge(Models,users.create_models(sequelize));
  _.merge(Models,items.create_models(sequelize));
  _.merge(Models,auction.create_models(sequelize));
  _.merge(Models,inventory.create_models(sequelize));

	Models.User.belongsToMany(Models.Item, { through: Models.Inventory });
  Models.Item.belongsToMany(Models.User, { through: Models.Inventory });

  Models.Auction.belongsTo(Models.User,{as:'Owner'});
  Models.Auction.belongsTo(Models.User,{as:'Winner'});
  Models.Auction.belongsTo(Models.Item);

	logger.debug('Done building models');

	exports.Models  = Models;
	exports.sequelize = sequelize;
	sequelize.sync();

  exports.create_default_user = function(username){
    var usr = null;
    return Models.User.create({
              coins: 1000,
              username: username
            })
            .then(function(user){
              usr = user;
              return Models.Inventory.bulkCreate([
                              { userId:user.id, itemId: 1, quantity:30}, //bread
                              { userId:user.id, itemId: 2, quantity:18}, //carrots
                              { userId:user.id, itemId: 3, quantity:1}, //diamonds
                            ]);
            })
            .then(function(){
              return usr;
            });
  };

  sequelize.transaction(function(t){
    return Q.all([
      Models.Item.findOrCreate({
				where: {id:1},
				defaults:{
					name:'Bread',
					icon_url:'modules/core/img/bread.jpg'
				},
				transaction: t}),
      Models.Item.findOrCreate({
				where: {id:2},
				defaults: {
					name:'Carrot',
					icon_url:'modules/core/img/carrot.jpg'
				},
				transaction: t}),
      Models.Item.findOrCreate({
				where: {id:3},
				defaults: {
					name:'Diamond',
					icon_url:'modules/core/img/diamond.png'
				},
				transaction: t})
    ]);
  });

	return sequelize;
};
