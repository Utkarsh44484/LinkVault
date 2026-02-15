const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // unique username
    username: { type: String, required: true, unique: true },

    // hashed password
    password: { type: String, required: true },

    // account creation time
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);