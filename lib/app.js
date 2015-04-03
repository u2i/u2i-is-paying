"use strict";

require('./models/db');

var express = require('express'),
  bodyParser = require('body-parser'),
  session = require('cookie-session'),
  app = express(),
  users = require('./routes/users'),
  auth = require('./routes/auth'),
  passport = require('passport'),
  GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  auth = require('./routes/auth'),
  config = require('config'),
  moment = require('moment'),
  mountPoint = config.get('mountPoint');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(id, done) {
  done(null, id);
});

passport.use(new GoogleStrategy({
    clientID: config.get('googleClientId'),
    clientSecret: config.get('googleClientSecret'),
    callbackURL: 'http://' + config.get('domain') + mountPoint + '/auth/google/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    User.verify(accessToken, refreshToken, profile, done);
  }
));

app.use(bodyParser.json());
app.use(session({
  secret: config.get('sessionSecret'),
  overwrite: true,
  expires: moment().add(1, 'years').toDate(),
  path: mountPoint === '' ? '/' : mountPoint
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(mountPoint + '/users', users);
app.use(mountPoint + '/auth', auth(passport));

module.exports = app;
