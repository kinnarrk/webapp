var express = require('express');
var router = express.Router();

const passport = require('passport');

const users = require("../controllers/users.controller.js");
const db = require("../models");
const User = db.users;
const Op = db.Sequelize.Op;

var bcryptUtil = require('../lib/utils');

const emailValidator = require("email-validator");
const passwordValidator = require('password-validator');
const passwordPattern = new passwordValidator();
const bcrypt = require('bcryptjs');

var logger = require('../config/winston');

const {
    ensureAuthenticated
} = require('../config/auth');

/* GET users listing. */
// router.post('/', function(req, res, next) {
//     res.send('respond with a resource');
// });
router.get('/login', (req, res) => {
    errors = [];
    res.render('login');
    req.session.flash = [];
    logger.info('User route login get');
});

//Login
router.post('/login', (req, res, next) => {
    console.log("return path=" + req.session.returnTo);
    passport.authenticate('local', {
        successRedirect: req.session.returnTo || '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// router.post('/login',
//     passport.authenticate('local', { failureRedirect: '/login' }),
//     function(req, res) {
//         res.redirect('/');
//     });

router.get('/register', function(req, res, next) {
    res.render('register');
    req.session.flash = [];
});

router.post('/register', function(req, res, next) {
    const {
        first_name,
        last_name,
        email,
        password
    } = req.body;
    errors = [];
    // Validate request
    if (!req.body.email || !req.body.password || !req.body.first_name || !req.body.last_name) {
        errors.push({
            msg: 'Fields can not be empty!'
        });
    }

    // console.info("past empty validation")

    const validEmail = emailValidator.validate(req.body.email);

    passwordPattern.is().min(8)
        .is().max(100)
        .has().uppercase()
        .has().lowercase()
        .has().digits()
        .has().symbols()
        .has().not().spaces();
    const validPassword = passwordPattern.validate(req.body.password);

    if (!validEmail) {
        errors.push({
            msg: 'Please enter valid E-mail'
        });
        // console.info('error in validEmail');
    }

    if (!validPassword) {
        errors.push({
            msg: 'Password must contain minimum 8 characters with at least 1 uppercase, 1 lowercase, 1 digit and 1 symbol'
        });
        // console.info('error in validPassword');
    }
    if (errors.length > 0) {
        // console.info('errors.length', errors.length);
        res.render('register', {
            errors,
            first_name,
            last_name,
            email,
            password
        });
        req.session.flash = [];
    } else {
        // console.info('else');
        User.findOne({
            where: { email: req.body.email }
        }).then(user => {
            // console.info('user find');
            if (user) {
                errors.push({
                    msg: 'Email already exists'
                });
                // console.info('user exists');
                res.render('register', {
                    errors,
                    first_name,
                    last_name,
                    email,
                    password
                });
                req.session.flash = [];
            } else {
                // Create a User
                // console.info('creating user');
                const user1 = {
                    email: req.body.email,
                    password: req.body.password,
                    first_name: req.body.first_name,
                    last_name: req.body.last_name
                };

                // bcrypt.genSalt(10, (err, salt) => {
                //     bcrypt.hash(user1.password, salt, (err, hash) => {
                //         if (err) throw err;
                        user1.password = bcryptUtil.bcryptText(user1.password);
                        console.info("bcrypt password: " + user1.password)
                        // Save User in the database
                        User.create(user1)
                            .then(data => {
                                req.flash(
                                    'success_msg',
                                    'You are successfully registered'
                                );
                                errors = [];
                                res.redirect('/users/login');
                                // console.info('success');
                            })
                            .catch(err => {
                                req.flash(
                                    'error_msg',
                                    'Error occurred in registration'
                                );
                                console.info('insert error', err);
                            });
                    // });
                // });


            }
        });
    }
});

router.get('/profile', ensureAuthenticated, (req, res) => {
    errors = [];
    res.render('profile');
    req.session.flash = [];
});

router.post('/profile', ensureAuthenticated, (req, res) => {
    const {
        first_name,
        last_name,
        email,
        password
    } = req.body;
    errors = [];
    // Validate request
    if (!req.body.email || !req.body.first_name || !req.body.last_name) {
        errors.push({
            msg: 'Fields can not be empty!'
        });
    }

    if (errors.length > 0) {
        // console.info('errors.length', errors.length);
        res.render('profile', {
            errors,
            first_name,
            last_name,
            email
        });
        req.session.flash = [];
    } else {
        // Update a User
        // console.info('updating user');
        const user1 = {
            first_name: req.body.first_name,
            last_name: req.body.last_name
        };

        User.update(user1, {
            where: {email: req.body.email}
        })
        .then(num => {
            if (num == 1) {
                req.flash(
                    'success_msg',
                    'Profile was updated successfully.'
                );
                errors = [];
                res.redirect('/users/profile');
                // res.render('profile');
                // req.session.flash = [];
            } else {
                req.flash(
                    'error_msg',
                    'Error updating profile'
                );
            }
        })
        .catch(err => {
            req.flash(
                'error_msg',
                'Error updating profile'
            );
        });
    }
});

router.get('/changePassword', ensureAuthenticated, (req, res) => {
    errors = [];
    res.render('changePassword');
    req.session.flash = [];
});

router.post('/changePassword', ensureAuthenticated, (req, res) => {
    const {
        password
    } = req.body;
    errors = [];
    // Validate request
    if (!req.body.oldPassword || !req.body.newPassword || !req.body.confirmPassword) {
        errors.push({
            msg: 'Fields can not be empty!'
        });
    }

    if (req.body.oldPassword == req.body.newPassword) {
        errors.push({
            msg: 'Old and new passwords can not be same!'
        });
    }

    passwordPattern.is().min(8)
        .is().max(100)
        .has().uppercase()
        .has().lowercase()
        .has().digits()
        .has().symbols()
        .has().not().spaces();
    const validPassword = passwordPattern.validate(req.body.newPassword);

    if (!validPassword) {
        errors.push({
            msg: 'Password must contain minimum 8 characters with at least 1 uppercase, 1 lowercase, 1 digit and 1 symbol'
        });
        // console.info('error in validPassword');
    }




    if (errors.length > 0) {
        // console.info('errors.length', errors.length);
        res.render('changePassword', {
            errors
        });
        req.session.flash = [];
    } else {
        // Update a User
        // console.info('updating user');
        const user1 = {
            password: req.body.newPassword,
        };
        const user = User.findByPk(req.user.id).then(user => {
            if(user){
                bcrypt.compare(req.body.oldPassword, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(user1.password, salt, (err, hash) => {
                                if (err) throw err;
                                user1.password = hash;
                                // Save User in the database

                                User.update(user1, {
                                    where: {id: req.user.id}
                                }).then(num => {
                                    if (num == 1) {
                                        req.flash(
                                            'success_msg',
                                            'Password changed successfully.'
                                        );
                                        errors = [];
                                        res.redirect('/users/changePassword');
                                        // res.render('profile');
                                        // req.session.flash = [];
                                    } else {
                                        req.flash(
                                            'error_msg',
                                            'Error changing password'
                                        );
                                        res.redirect('/users/changePassword');
                                    }
                                }).catch(err => {
                                    req.flash(
                                        'error_msg',
                                        'Error changing password'
                                    );
                                    res.redirect('/users/changePassword');
                                });
                            });
                        });
                    } else {
                        req.flash(
                            'error_msg',
                            'Old password incorrect!'
                        );
                        res.redirect('/users/changePassword');
                    }
                });
            } else {
                req.flash(
                    'error_msg',
                    'Invalid user request!'
                );
                res.redirect('/users/changePassword');
            }
        });
    }
});

// router.post("/", users.create);

// Retrieve single user
// router.get("/:email", users.findOne);

//Logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;
