"use strict";

require('../lib/models/db');

var mongoose = require('mongoose'),
  Monky = require('monky'),
  monky = new Monky(mongoose);

monky.factory({name: 'Student', model: 'User'}, {
  name: 'Student#n',
  email: 'student#n@rebelion.com',
  contract: 'Student',
  employeeGrossSalary: {
    full: 5000,
    reduced: 4000
  },
  numberOfShares: 0
});

monky.factory({name: 'Employee', model: 'User'}, {
  name: 'Employee#n',
  email: 'employee#n@rebelion.com',
  contract: 'Employee',
  employeeGrossSalary: {
    full: 8000,
    reduced: 6000
  },
  numberOfShares: 5
});

monky.factory({name: 'Contractor', model: 'User'}, {
  name: 'Contractor#n',
  email: 'contractor#n@rebelion.com',
  contract: 'Contractor',
  employeeGrossSalary: {
    full: 10000,
    reduced: 8000
  },
  numberOfShares: 10
});

module.exports = monky;
