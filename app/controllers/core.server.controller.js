'use strict';

var config = require('../../config');

exports.index = function(req, res) {
    res.render('index', {
      title: config.title,
      test: 'Nananana Batman!'
    });
};
