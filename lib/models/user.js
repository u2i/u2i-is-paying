"use strict";

var mongoose = require('mongoose'),
  timestamps = require('mongoose-timestamp'),
  contractTypes = ['Employee', 'Contractor', 'Student'];

var userSchema = mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true
  },
  contract: {
    type: String,
    enum: contractTypes
  },
  employeeGrossSalary: {
    full: Number,
    reduced: Number
  },
  numberOfShares: {
    type: Number,
    defualt: 0
  },
  admin: Boolean
});

userSchema.statics.verify = function(accessToken, refreshToken, profile, done) {
  var self = this;
  self.findOne({
    email: profile.emails[0].value
  }, function(err, user) {
    if (err || !user) {
      done(null, false, {
        message: "User not found"
      });
    } else {
      done(err, user);
    }
  });
};

userSchema.plugin(timestamps);

module.exports = mongoose.model('User', userSchema);
