const LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcryptjs');

// Load User model
const db = require("../models");
const User = db.users;
const Op = db.Sequelize.Op;

module.exports = function (passport) {
    console.info("1");
    passport.use(
        new LocalStrategy({
            usernameField: 'email'
        }, (email, password, done) => {
            console.info("email" + email);
            // Match user
            User.findOne({
                where: { email: email }
            }).then(user => {
                console.info("got user");
                if (!user) {
                    console.info("!user");
                    return done(null, false, {
                        message: 'That email is not registered'
                    });
                }

                if(user.password == undefined) {
                    console.info("!password");
                    return done(null, false, {
                        message: 'Email or Password incorrect'
                    });
                }

                // Match password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    console.info("comparing...");
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, {
                            message: 'Password incorrect'
                        });
                    }
                });
            });
        })
    );

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // passport.deserializeUser(function (id, done) {
    //     User.findByPk(id, function (err, user) {
    //         done(err, user);
    //     });
    // });

    passport.deserializeUser(function(id, done) {
        User.findByPk(id).then(function(user) {
            if (user) {
                done(null, user.get());
            } else {
                done(user.errors, null);
            }
        });
    });
};
