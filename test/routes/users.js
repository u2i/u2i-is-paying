"use strict";

var helper = require('../test_helper'),
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = require('chai').expect,
  app = require('../../lib/app'),
  mongoose = require('mongoose'),
  User = mongoose.model('User');

chai.use(chaiHttp);

describe('user routes', function() {
  describe("#updateAll", function() {
    it("returns 400 if the data is missing", function(done) {
      chai.request(app)
        .post('/users/update')
        .send({
          signature: 'asdf'
        })
        .end(function(err, res) {
          expect(res).to.have.status(400);
          done();
        });
    });

    it("returns 400 if the data is missing", function(done) {
      chai.request(app)
        .post('/users/update')
        .send({
          data: [
            ['asdf']
          ]
        })
        .end(function(err, res) {
          expect(res).to.have.status(400);
          done();
        });
    });

    it("returns 401 if the data doesn't match the signature", function(done) {
      chai.request(app)
        .post('/users/update')
        .send({
          data: [
            ['asdf']
          ],
          signature: 'qwerty'
        })
        .end(function(err, res) {
          expect(res).to.have.status(401);
          done();
        });
    });

    it("is a success", function(done) {
      chai.request(app)
        .post('/users/update')
        .send({
          data: [
            ['TestUser1',
              'testUser@test.com',
              'D--',
              'Student',
              0.6,
              5000,
              6500,
              6500,
              4500,
              4200,
              8000,
              7000,
              1500,
              1,
              3,
              75
            ]
          ],
          signature: 'REGphBS+alcE0YOyG90pZxniV/zXnywIi4tHmTBWUco='
        })
        .end(function(err, res) {
          expect(res).to.have.status(200);
          done();
        });
    });

    it("creates the users and updates existing ones", function(done) {
      helper.clearDb(function() {
        helper.factories.create('Employee', {
            email: 'testUser@test.com'
          })
          .then(function(createdStudents) {
            chai.request(app)
              .post('/users/update')
              .send({
                data: [
                  ['TestUser1',
                    'testUser@test.com',
                    'D--',
                    'Student',
                    0.6,
                    5000,
                    6600,
                    6500,
                    4500,
                    4200,
                    8000,
                    7000,
                    1500,
                    1,
                    3,
                    75
                  ],
                  ['TestUser2',
                    'testUser2@test.com',
                    'D',
                    'Contractor',
                    0.6,
                    9000,
                    10000,
                    7500,
                    5500,
                    500,
                    9000,
                    8000,
                    1500,
                    3,
                    9,
                    100
                  ]
                ],
                signature: 'vEWVc4cZftpTr6qWo0aGSzOnp3AHg2D60lnd+n6ww14='
              })
              .end(function(err, res) {
                expect(res).to.have.status(200);
                User.find().sort('name').exec().then(function(users) {
                  expect(users[0].name).to.equal('TestUser1');
                  expect(users[0].email).to.equal('testUser@test.com');
                  expect(users[0].contract).to.equal('Student');
                  expect(users[0].employeeGrossSalary.full).to.equal(6600);
                  expect(users[0].employeeGrossSalary.reduced).to.equal(6500);
                  expect(users[0].numberOfShares).to.equal(3);
                  expect(users[1].name).to.equal('TestUser2');
                  expect(users[1].email).to.equal('testUser2@test.com');
                  expect(users[1].contract).to.equal('Contractor');
                  expect(users[1].employeeGrossSalary.full).to.equal(10000);
                  expect(users[1].employeeGrossSalary.reduced).to.equal(7500);
                  expect(users[1].numberOfShares).to.equal(9);
                  done();
                });
              });
          });
      });
    });
  });

  describe("#index", function() {
    var students, employees, contractors;

    before(function(done) {
      helper.clearDb()
        .then(function() {
          return helper.factories.create('Student');
        })
        .then(function(createdStudent) {
          students = [createdStudent];
          return helper.factories.create('Student');
        })
        .then(function(createdStudent) {
          students.push(createdStudent);
          return helper.factories.create('Employee');
        })
        .then(function(createdEmployee) {
          employees = [createdEmployee];
          return helper.factories.create('Employee');
        })
        .then(function(createdEmployee) {
          employees.push(createdEmployee);
          return helper.factories.create('Contractor')
        })
        .then(function(createdContractor) {
          contractors = [createdContractor];
          return helper.factories.create('Contractor')
        })
        .then(function(createdContractor) {
          contractors.push(createdContractor);
          done();
        });
    });

    it("returns 401 if the user is not logged in", function(done) {
      chai.request(app)
        .get('/users')
        .end(function(err, res) {
          expect(res).to.have.status(401);
          expect(res).to.be.json;
          expect(res.body.error).to.equal("You must be logged in to perform this action");
          done();
        });
    });

    it("is a success", function(done) {
      chai.request(app)
        .get('/users')
        .set('Cookie', helper.sessionCookies({
          'passport': {
            'user': students[0].id
          }
        }))
        .end(function(err, res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          done();
        });
    });

    it("it only shows yours and contractor salaries if you're not an admin", function(done) {
      chai.request(app)
        .get('/users')
        .set('Cookie', helper.sessionCookies({
          'passport': {
            'user': students[0].id
          }
        }))
        .end(function(err, res) {
          var i;
          expect(res.body.length).to.eq(6);
          for (i = 0; i < 2; i++) {
            expect(res.body[i].contract).to.eq('Student');
            expect(res.body[i].name).to.eq(students[i].name);
          }
          expect(res.body[0].employeeGrossSalary.full).to.eq(5000);
          expect(res.body[0].employeeGrossSalary.reduced).to.eq(4000);
          expect(res.body[0].numberOfShares).to.eq(0);
          expect(res.body[1].employeeGrossSalary.full).to.eq(-1);
          expect(res.body[1].employeeGrossSalary.reduced).to.eq(-1);
          expect(res.body[1].numberOfShares).to.eq(-1);
          for (i = 2; i < 4; i++) {
            expect(res.body[i].name).to.eq(employees[i%2].name);
            expect(res.body[i].contract).to.eq('Employee');
            expect(res.body[i].employeeGrossSalary.full).to.eq(-1);
            expect(res.body[i].employeeGrossSalary.reduced).to.eq(-1);
            expect(res.body[i].numberOfShares).to.eq(-1);
          }
          for (i = 4; i < 6; i++) {
            expect(res.body[i].name).to.eq(contractors[i%2].name);
            expect(res.body[i].contract).to.eq('Contractor');
            expect(res.body[i].employeeGrossSalary.full).to.eq(10000);
            expect(res.body[i].employeeGrossSalary.reduced).to.eq(8000);
            expect(res.body[i].numberOfShares).to.eq(10);
          }
          done();
        });
    });

    it("it shows all salaries if you're an admin", function(done) {
      employees[0].admin = true;
      employees[0].save(function() {
        chai.request(app)
          .get('/users')
          .set('Cookie', helper.sessionCookies({
            'passport': {
              'user': employees[0].id
            }
          }))
          .end(function(err, res) {
            var i;
            expect(res.body.length).to.eq(6);

            for (i = 0; i < 2; i++) {
              expect(res.body[i].name).to.eq(students[i].name);
              expect(res.body[i].contract).to.eq('Student');
              expect(res.body[i].employeeGrossSalary.full).to.eq(5000);
              expect(res.body[i].employeeGrossSalary.reduced).to.eq(4000);
              expect(res.body[i].numberOfShares).to.eq(0);
            }
            for (i = 2; i < 4; i++) {
              expect(res.body[i].name).to.eq(employees[i%2].name);
              expect(res.body[i].contract).to.eq('Employee');
              expect(res.body[i].employeeGrossSalary.full).to.eq(8000);
              expect(res.body[i].employeeGrossSalary.reduced).to.eq(6000);
              expect(res.body[i].numberOfShares).to.eq(5);
            }
            for (i = 4; i < 6; i++) {
              expect(res.body[i].name).to.eq(contractors[i%2].name);
              expect(res.body[i].contract).to.eq('Contractor');
              expect(res.body[i].employeeGrossSalary.full).to.eq(10000);
              expect(res.body[i].employeeGrossSalary.reduced).to.eq(8000);
              expect(res.body[i].numberOfShares).to.eq(10);
            }
            done();
          });
      });
    });
  });

  describe("#info", function() {
    var students, employees, contractors;

    before(function(done) {
      helper.clearDb()
        .then(function() {
          return helper.factories.createList('Student', 2);
        })
        .then(function(createdStudents) {
          students = createdStudents;
          return helper.factories.createList('Employee', 2);
        })
        .then(function(createdEmployees) {
          employees = createdEmployees;
          return helper.factories.createList('Contractor', 2)
        })
        .then(function(createdContractors) {
          contractors = createdContractors;
          done();
        });
    });

    it("is a success", function(done) {
      chai.request(app)
        .get('/users/info')
        .end(function(err, res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          done();
        });
    });

    it("returns only general data", function(done) {
      chai.request(app)
        .get('/users/info')
        .end(function(err, res) {
          var i;
          expect(res.body.length).to.eq(3);

          for (i = 0; i < 3; i++) {
            expect(res.body[i].name).to.be.undefined;
          }
          expect(res.body[0].contract).to.eq('Student');
          expect(res.body[0].employeeGrossSalary.full).to.eq(5000);
          expect(res.body[0].employeeGrossSalary.reduced).to.eq(4000);
          expect(res.body[0].numberOfShares).to.eq(0);
          expect(res.body[1].contract).to.eq('Employee');
          expect(res.body[1].employeeGrossSalary.full).to.eq(8000);
          expect(res.body[1].employeeGrossSalary.reduced).to.eq(6000);
          expect(res.body[1].numberOfShares).to.eq(5);
          expect(res.body[2].contract).to.eq('Contractor');
          expect(res.body[2].employeeGrossSalary.full).to.eq(10000);
          expect(res.body[2].employeeGrossSalary.reduced).to.eq(8000);
          expect(res.body[2].numberOfShares).to.eq(10);
          done();
        });
    });
  });

  describe("#current", function() {

    it("returns 401 if the user is not logged in", function(done) {
      chai.request(app)
        .get('/users/current')
        .end(function(err, res) {
          expect(res).to.have.status(401);
          expect(res).to.be.json;
          expect(res.body.error).to.equal("You must be logged in to perform this action");
          done();
        });
    });

    describe("when the user is logged in", function() {

      var user;

      before(function(done) {
        helper.clearDb()
          .then(function() {
            return helper.factories.create('Contractor')
          })
          .then(function(createdUser) {
            user = createdUser;
            done();
          });
      });

      it("is a success", function(done) {
        chai.request(app)
          .get('/users/current')
          .set('Cookie', helper.sessionCookies({
            'passport': {
              'user': user.id
            }
          }))
          .then(function(res) {
            expect(res).to.have.status(200);
            done();
          });
      });

      it("returns the user", function(done) {
        chai.request(app)
          .get('/users/current')
          .set('Cookie', helper.sessionCookies({
            'passport': {
              'user': user.id
            }
          }))
          .end(function(err, res) {
            expect(res).to.be.json;
            expect(res.body.name).to.equal(user.name);
            expect(res.body.contract).to.equal(user.contract);
            expect(res.body.employeeGrossSalary.full).to.equal(user.employeeGrossSalary.full);
            expect(res.body.employeeGrossSalary.reduced).to.equal(user.employeeGrossSalary.reduced);
            expect(res.body.numberOfShares).to.equal(user.numberOfShares);
            done();
          });
      });
    });
  });
});
