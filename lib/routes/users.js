"use strict";

var express = require('express'),
  router = express.Router(),
  users = require('../controllers/users');

router.route('/')
  .get(users.ensureAuthenticated, users.index);
router.route('/current')
  .get(users.ensureAuthenticated, users.current);
router.route('/info')
  .get(users.info);
router.route('/update')
  .post(users.updateAll);

module.exports = router;
