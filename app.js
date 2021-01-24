const { join } = require('path');
const express = require('express');
const createError = require('http-errors');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const serveFavicon = require('serve-favicon');
const session = require('express-session');
const connectMongo = require('connect-mongo');
const MongoStore = connectMongo(session);
const mongoose = require('mongoose');
const User = require('./models/user');

const indexRouter = require('./routes/index');

const app = express();

// Setup view engine
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'hbs');

//middleware
app.use(express.static(join(__dirname, 'public')));
app.use(serveFavicon(join(__dirname, 'public/images', 'favicon.ico')));

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(
    sassMiddleware({
        src: join(__dirname, 'public'),
        dest: join(__dirname, 'public'),
        outputStyle: process.env.NODE_ENV === 'development' ? 'nested' : 'compressed',
        force: process.env.NODE_ENV === 'development',
        sourceMap: true
    })
);

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: false,
        cookie: {
            maxAge: 15 * 24 * 60 * 60 * 1000
        },
        store: new MongoStore({
            mongooseConnection: mongoose.connection,
            ttl: 60 * 60
        })
    })
);

// Deserializing the user
const userDeserializationMiddleware = (req, res, next) => {
    if (req.session.userId) {
        User.findById(req.session.userId)
            .then((user) => {
                req.user = user;
                res.locals.user = user;
                next();
            })
            .catch((error) => {
                next(error);
            });
    } else {
        next();
    }
};
app.use(userDeserializationMiddleware);

//routes
app.use('/', indexRouter);

// Catch missing routes and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// Catch all error handler
app.use((error, req, res, next) => {
    // Set error information, with stack only available in development
    res.locals.message = error.message;
    res.locals.error = req.app.get('env') === 'development' ? error : {};

    res.status(error.status || 500);
    res.render('error');
});

module.exports = app;