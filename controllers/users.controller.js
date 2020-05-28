const db = require("../models");
const User = db.users;
const Op = db.Sequelize.Op;

const emailValidator = require("email-validator");
const passwordValidator = require('password-validator');
const passwordPattern = new passwordValidator();
const bcrypt = require('bcryptjs');

// Create and Save a new User
exports.create = (req, res) => {

    errors = [];
    // Validate request
    if (!req.body.email || !req.body.password || !req.body.first_name || !req.body.last_name) {
        errors.push({
            msg: 'Fields can not be empty!'
        });
    }

    const validEmail = emailValidator.validate(req.body.email);

    passwordPattern.is().min(8)
        .is().max(100)
        .has().uppercase()
        .has().lowercase()
        .has().digits()
        .has().not().spaces();
    const validPassword = passwordPattern.validate(req.body.password);

    if (!validEmail) {
        errors.push({
            msg: 'Please enter valid E-mail'
        });
    }

    if (!validPassword) {
        errors.push({
            msg: 'Password must contains at least 8 characters, 1 uppercase, 1 lowercase, 1 digit'
        });
    }
    if (errors.length > 0) {
        res.render('../views/register', {
            errors,
            fullName,
            email,
            password,
            phone
        });
    } else {
        User.findOne({
            email: email
        }).then(user => {

            if (user) {
                errors.push({
                    msg: 'Email already exists'
                });
                res.render('../views/register', {
                    errors,
                    fullName,
                    email,
                    password,
                    phone
                });
            } else {
                // Create a User
                const user = {
                    email: req.body.email,
                    password: req.body.password,
                    first_name: req.body.first_name,
                    last_name: req.body.last_name
                };
                const newUser = new User({
                    roleId: role._id,
                    fullName: fullName,
                    email: email,
                    password: password,
                    phone: phone,
                    image: 'user.png'
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(user.password, salt, (err, hash) => {
                        if (err) throw err;
                        user.password = hash;
                        // Save User in the database
                        User.create(user)
                            .then(data => {
                                req.flash(
                                    'success_msg',
                                    'You are successfully registered'
                                );
                                errors = [];
                                res.redirect('/users/login');
                            })
                            .catch(err => {
                                req.flash(
                                    'error_msg',
                                    'Error occurred in registration'
                                );
                            });
                    });
                });


            }
        });
    }
    // Create a User
    // const user = {
    //     email: req.body.email,
    //     password: req.body.password,
    //     first_name: req.body.first_name,
    //     last_name: req.body.last_name
    // };

    // Save User in the database
    User.create(user)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the User."
            });
        });
};

// Retrieve all Users from the database.
exports.findAll = (req, res) => {

};

// Find a single User with an id
exports.findOne = (req, res) => {
    const email = req.query.email;
    var condition = email ? { email: { [Op.eq]: email } } : null;

    User.findAll({ where: condition })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving tutorials."
            });
        });
};

// Update a User by the id in the request
exports.update = (req, res) => {

};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {

};

// Delete all Users from the database.
exports.deleteAll = (req, res) => {

};

// Find all authorized Users
exports.findAllAuthorized = (req, res) => {

};
