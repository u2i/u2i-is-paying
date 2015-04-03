"use strict";

var config = require('config'),
  express = require('express'),
  router = express.Router();

module.exports = function(passport) {
  router.route('/google').get(passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.login',
      'email'
    ]
  }));
  router.route('/google/callback').get(passport.authenticate('google', {
    failureRedirect: '/'
  }), function(req, res) {
    res.redirect('/');
  });
  return router;
};
