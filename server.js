'use strict';

var fs = require('fs'),
	http = require('http'),
	express = require('express'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
  DB = require('./app/models/db.models'),
	AuctionHouse = require('./app/services/auction.service.js'),
	config = require('./config'),
	consolidate = require('consolidate'),
	logger = require('winston'),
	_ = require('lodash'),
	path = require('path');

logger.remove(logger.transports.Console)
        .add(logger.transports.Console,{
        	colorize:true,
					prettyPrint:true,
					handleExceptions: true,
    			humanReadableUnhandledException: true,
        	level:config.logging.level,
        	timestamp:true
				});

var db = DB.connect(config.db.database,
					config.db.username,
					config.db.password,
					config.db.options);

var app = express();

app.locals.title = config.app.title;

app.engine('server.view.html', consolidate.swig);

// Set views path and view engine
app.set('view engine', 'server.view.html');
app.set('views', './app/views');

app.set('view cache', false);

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(express.static(path.resolve('./public')));
require('./app/routes.js').http(app);

var server = app.listen(config.app.port);
var io = require('socket.io')(server);

// io.use(function(socket, next){
//   // Wrap the express middleware
//   sessions(socket.request, {}, next);
// });
_.each(io.nsps, function(nsp){
  nsp.on('connect', function(socket){
    if (!socket.auth) {
      logger.debug('Removing socket from', nsp.name);
      delete nsp.connected[socket.id];
    }
  });
});


io.on('connection', require('./app/routes.js').socketio);
AuctionHouse.run(io);
// Logging initialization
logger.info('Application started on port ' + config.app.port);
