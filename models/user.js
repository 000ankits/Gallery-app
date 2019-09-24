const mongoose = require('mongoose');
const image = require('./image');
const localMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
	username : String,
	password : String
});

userSchema.plugin(localMongoose);

module.exports = mongoose.model('user', userSchema);
