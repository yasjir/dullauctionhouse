'use strict';

var core = require('./controllers/core.server.controller'),
		user = require('./controllers/user.server.controller'),
		auction = require('./controllers/auction.server.controller'),
		logger = require('winston');

exports.http = function(app) {
		app.get('/',core.index);
};


exports.socketio = function(socket){
	//object used for storing additional socket connection information
  socket.user = null;
	socket.set_user = function(user){
		this.user = user;
	};



	//test connestion
  socket.emit('greet',{message:'IO is working..'});

	//route messages
	socket.on('authorization',user.authorization.bind(null,socket));
	socket.on('login',user.login.bind(null,socket));
	socket.on('logout',user.logout.bind(null,socket));
	socket.on('user',user.data.bind(null,socket));

	socket.on('auctions',auction.get_undone.bind(null,socket));
	socket.on('auction.new',auction.set_new.bind(null,socket));
	socket.on('auction.bid',auction.place_bid.bind(null,socket));
};
