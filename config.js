'use strict';

module.exports = {
  app:{
    tile: 'CrossOver Test',
    port: 8080,
  },
  db:{
		database: null,
		username: null,
		password: null,
		options:{
			storage: 'dev.db',
	    dialect: 'sqlite'
		}
	},
  logging:{
    level:'debug'
  },
  sessionSecret: 'VerySecretKey'
};
