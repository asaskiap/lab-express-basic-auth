const express = require('express');
const router = new express.Router();
const User = require('./../models/user');
const bcryptjs = require('bcryptjs');

//home
router.get('/', (req, res, next) => {
    res.render('index');
});

//create account
router.get('/create-account', (req, res, next) => {
    res.render('create-account');
});

router.post('/create-account', (req, res, next) => {
    const data = req.body;

    // check if username already exists:
    User.findOne({
            username: data.username
        })
        .then((user) => {
            if (user) {
                // a user with that username already exists
                throw new Error('Username already taken');
            } else {
                //hash password
                return bcryptjs.hash(data.password, 10);
            }
        })
        .then((passwordHashAndSalt) => {
            //create new user and pass hashed password

            return User.create({
                username: data.username,
                passwordHashAndSalt: passwordHashAndSalt
            });
        })
        .then((user) => {
            console.log(user);
            // create new session and redirect user to their profile
            req.session.userId = user._id;
            res.redirect('/profile');
        })
        .catch((error) => {
            next(error);
        });
});

// log in
router.get('/log-in', (req, res, next) => {
    res.render('log-in');
});

router.post('/log-in', (req, res, next) => {
    const data = req.body;
    let user;
    User.findOne({
            username: data.username
        })
        .then((userData) => {
            user = userData;
            if (user) {
                return bcryptjs.compare(data.password, user.passwordHashAndSalt);
            } else {
                throw new Error('There is no user registered with this username');
            }
        })
        .then((resultOfPwdCheck) => {
            if (resultOfPwdCheck) {
                req.session.userId = user._id;
                res.redirect('/profile');
            } else {
                throw new Error('Incorrect password!');
            }
        })
        .catch((error) => {
            next(error);
        });
});

// private

router.get('/private', (req, res, next) => {
    res.render('private');
});

// main

router.get('/main', (req, res, next) => {
    res.render('main');
});

//profile
router.get('/profile', (req, res, next) => {
    res.render('profile');
});

//log out

router.post('/log-out', (req, res, next) => {
    //req.session.userId = undefined;
    // delete req.session.userId;
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;