const mongoose= require('mongoose');

const userModel = new mongoose.Schema({
    email: {type: String, require: true},
    userName: {type: String},
    password: {type: String, require: true},
    verified: {type: Boolean, require: true}
});

module.exports = mongoose.model('User', userModel);