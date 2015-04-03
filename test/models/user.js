"use strict";

var helper = require('../test_helper'),
  chai = require('chai'),
  sinon = require('sinon'),
  sinonChai = require('sinon-chai'),
  expect = require('chai').expect,
  mongoose = require('mongoose'),
  User = mongoose.model('User');

describe("user model", function() {

  var user1;

  beforeEach(function(done) {
    helper.clearDb(function() {
      helper.factories.create('Student', function(err, createdUser) {
        user1 = createdUser;
        done();
      });
    });
  });

  describe('.verify', function() {
    it("returns an error message when user email doesn't match the patternhasn't been found", function(done) {
      User.verify(null, null, {
        emails: [{
          value: 'test@test.com'
        }]
      }, function(err, user, messageObj) {
        expect(err).to.be.null;
        expect(user).to.be.false;
        expect(messageObj.message).to.eq("User not found");
        done();
      });
    });

    it("returns the user if it already exists", function(done) {
      User.verify(null, null, {
        emails: [{
          value: user1.email
        }]
      }, function(err, user, messageObj) {
        expect(err).to.be.null;
        expect(user.id).to.equal(user1.id);
        expect(messageObj).to.be.undefined;
        done();
      });
    });
  });
});
