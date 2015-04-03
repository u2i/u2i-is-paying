"use strict";

var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  config = require('config'),
  async = require('async'),
  crypto = require('crypto'),
  mountPoint = config.get('mountPoint');

module.exports.current = function(req, res) {
  User.findById(req.session.passport.user).select('-email').exec(function(err, usr) {
    if (err || usr === null) {
      res.status(404).json({
        redirect: mountPoint + '/auth/google',
        error: "User not found"
      });
    } else {
      res.json(usr);
    }
  });
};

module.exports.info = function(req, res) {
  User
    .find()
    .sort('employeeGrossSalary.full numberOfShares contract name')
    .exec(function(err, users) {
      if (err) {
        res.status(503).json({
          error: "Something went wrong"
        });
      } else {
        var response = [],
          key, newKey, i;
        if (err) {
          res.status(503).json({
            error: "Something went wrong"
          });
        } else {
          for (i = 0; i < users.length; i++) {
            newKey = users[i].contract + '-' + users[i].employeeGrossSalary.full + '-' + users[i].numberOfShares;
            if (newKey != key) {
              key = newKey;
              response.push({
                contract: users[i].contract,
                employeeGrossSalary: users[i].employeeGrossSalary,
                numberOfShares: users[i].numberOfShares
              });
            }
          }
          res.json(response);
        }
      }
    });
};

module.exports.index = function(req, res) {
  User
    .find()
    .sort('employeeGrossSalary.full numberOfShares contract name')
    .exec(function(err, users) {
      if (err) {
        res.status(503).json({
          error: "Something went wrong"
        });
      } else {
        User.findById(req.session.passport.user).select('-email').exec(function(err, usr) {
          var response,
            key, newKey, i;
          if (err) {
            res.status(503).json({
              error: "Something went wrong"
            });
          } else {
            if (usr === null) {
              res.status(401).json({
                redirect: mountPoint + '/auth/google',
                error: 'You must be logged in to perform this action'
              });
            } else {
              for (i = 0; i < users.length; i++) {
                if (users[i].contract != 'Contractor' && !usr.admin && users[i].id != usr.id) {
                  users[i].employeeGrossSalary.full = -1;
                  users[i].employeeGrossSalary.reduced = -1;
                  users[i].numberOfShares = -1;
                }
              }
              res.json(users);
            }
          }
        });
      }
    });
};

module.exports.updateAll = function(req, res) {
  var i;
  if (!(req.body.data && req.body.signature)) return res.status(400).end();
  if(crypto.createHmac('SHA256', config.get('hmacKey')).update(JSON.stringify(req.body.data)).digest("base64") != req.body.signature) {
    return res.status(401).end();
  }
  async.each(req.body.data, function(userData, done) {
    User.findOneAndUpdate({
      email: userData[1]
    }, {
      name: userData[0],
      email: userData[1],
      contract: userData[3],
      'employeeGrossSalary.full': userData[6],
      'employeeGrossSalary.reduced': userData[7],
      numberOfShares: userData[14]
    }, {
      upsert: true
    }, done);
  }, function(err) {
    if (err) {
      res.status(503).json({
        error: "Something went wrong"
      });
    } else {
      res.status(200).end();
    }
  });
}

module.exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({
    redirect: mountPoint + '/auth/google',
    error: 'You must be logged in to perform this action'
  });
};
