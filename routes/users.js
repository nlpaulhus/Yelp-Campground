const express = require('express')
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utilities/asyncCatch');
const ExpressError = require('../utilities/expressError');
const User = require('../models/user');
const passport = require('passport');
const users = require('../controllers/users');

router.get('/register', (users.registrationPage));

router.post('/register', catchAsync(users.post));

router.get('/login', users.loginPage)

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

router.get('/logout', users.logout)

module.exports = router;