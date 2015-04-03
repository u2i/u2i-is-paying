"use strict";

if (process.env.NODE_ENV != 'test') {
  throw new Error("Tests need to be run with NODE_ENV set to test");
}

require('../lib/models/db');

var mongoose = require('mongoose'),
  async = require('async'),
  Keygrip = require('keygrip'),
  config = require('config'),
  Q = require('q'),
  factories = require('./factories.js');

module.exports.factories = factories;

module.exports.clearDb = function(done) {
  var deferred = Q.defer();
  async.each(mongoose.modelNames(), function(name, callback) {
      mongoose.model(name).remove({}, callback);
    },
    function(err) {
      if (typeof done == 'function') {
        done(err);
      } else {
        if (err) {
          deferred.reject(new Error(err));
        } else {
          deferred.resolve();
        }
      }
    });
  return deferred.promise;
};

module.exports.idMap = function(array) {
  var map = {};
  array.forEach(function(element, index) {
    map[element._id] = index;
  });
  return map;
}

module.exports.sessionCookies = function(sessionContent) {
  var keys = new Keygrip([config.get('sessionSecret')]),
    sessionCookie = 'express:sess=' + (new Buffer(JSON.stringify(sessionContent)).toString('base64'));
  return sessionCookie + '; ' + 'express:sess.sig=' + keys.sign(sessionCookie) + ';';
}
