const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 140
    },
    passwordHashAndSalt: {
        type: String,
        minlength: 3
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;